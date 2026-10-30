/**
 * ==============================================================================
 * PHANTOM WORKSPACE — CONTROLLER & INTERACTION CONTROLLER
 * Integrates PhantomEngine with Live Video, Overlay HUD, Key-Value Store,
 * Chronological Event Stream, Deterministic Search & Evidence Reveal
 * ==============================================================================
 */

(function () {
  'use strict';

  let engine = null;
  let activeTab = 'overview';
  let activeCategoryFilter = 'all';
  let activeEventFilter = 'all';
  let showBoundingBoxes = true;
  let selectedDeviceId = null;

  // DOM Elements
  const dom = {};

  function cacheDom() {
    dom.video = document.getElementById('cameraVideo');
    dom.overlayCanvas = document.getElementById('overlayCanvas');
    dom.btnStartMonitoring = document.getElementById('btnStartMonitoring');
    dom.btnStartMonitoringLabel = document.getElementById('btnStartMonitoringLabel');
    dom.btnHeaderAction = document.getElementById('btnHeaderAction');
    dom.hudDot = document.getElementById('hudDot');
    dom.hudText = document.getElementById('hudText');
    dom.envSelect = document.getElementById('envSelect');

    // Controls
    dom.cameraSourceSelect = document.getElementById('cameraSourceSelect');
    dom.resolutionSelect = document.getElementById('resolutionSelect');
    dom.intervalSlider = document.getElementById('intervalSlider');
    dom.intervalVal = document.getElementById('intervalVal');
    dom.btnCaptureNow = document.getElementById('btnCaptureNow');
    dom.btnToggleBoxes = document.getElementById('btnToggleBoxes');
    dom.fileUploadInput = document.getElementById('fileUploadInput');
    dom.btnUploadFallback = document.getElementById('btnUploadFallback');

    // Motion meter
    dom.motionMeterFill = document.getElementById('motionMeterFill');
    dom.motionMeterText = document.getElementById('motionMeterText');

    // Containers
    dom.statsTotalObjects = document.getElementById('statsTotalObjects');
    dom.statsRecentChanges = document.getElementById('statsRecentChanges');
    dom.statsLastObsTime = document.getElementById('statsLastObsTime');
    dom.recentEventsOverview = document.getElementById('recentEventsOverview');
    dom.activeDetectionsList = document.getElementById('activeDetectionsList');
    dom.objectsGrid = document.getElementById('objectsGrid');
    dom.objectsGridOverview = document.getElementById('objectsGridOverview');
    dom.timelineList = document.getElementById('timelineList');

    // Search
    dom.searchInput = document.getElementById('searchInput');
    dom.btnSearch = document.getElementById('btnSearch');
    dom.quickSearchInput = document.getElementById('quickSearchInput');
    dom.searchResultContainer = document.getElementById('searchResultContainer');

    // Drawer
    dom.drawerBackdrop = document.getElementById('drawerBackdrop');
    dom.drawerCloseBtn = document.getElementById('drawerCloseBtn');
    dom.drawerTitle = document.getElementById('drawerTitle');
    dom.drawerSubtitle = document.getElementById('drawerSubtitle');
    dom.drawerBody = document.getElementById('drawerBody');

    // Tabs
    dom.tabButtons = document.querySelectorAll('.tab-btn');
    dom.views = document.querySelectorAll('.workspace-view');
  }

  async function init() {
    cacheDom();

    // 1. Initialize shared PhantomEngine
    engine = new PhantomEngine({
      videoElement: dom.video,
      environmentId: dom.envSelect ? dom.envSelect.value : 'env_desk_01',
      motionThreshold: 0.04,
      settlingDelay: 1500
    });

    // 2. Attach Engine Listeners
    engine.on('statusChange', ({ status, detail }) => updateStatusUI(status, detail));
    engine.on('devicesDiscovered', (devices) => populateCameraSelect(devices));
    engine.on('motionScore', (score) => updateMotionMeter(score));
    engine.on('settling', ({ remaining, total }) => updateSettlingUI(remaining, total));
    engine.on('observationCommitted', (deltaResult) => handleNewObservation(deltaResult));

    // Boot engine
    await engine.init();

    // 3. Bind UI interactions
    bindEvents();

    // 4. Populate initial data views
    await refreshAllViews();

    // Start overlay render loop for live video annotations
    startOverlayLoop();
  }

  function bindEvents() {
    // Navigation Tabs
    dom.tabButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        switchTab(tab);
      });
    });

    // Quick launch monitor from overview
    document.getElementById('btnLaunchMonitorQuick')?.addEventListener('click', () => {
      switchTab('monitor');
    });

    // Monitoring Toggle
    const toggleMonitoring = async () => {
      if (engine.isMonitoring) {
        engine.stopMonitoring();
      } else {
        await engine.startMonitoring(selectedDeviceId);
      }
    };
    dom.btnStartMonitoring?.addEventListener('click', toggleMonitoring);
    dom.btnHeaderAction?.addEventListener('click', toggleMonitoring);

    // Camera source selector
    dom.cameraSourceSelect?.addEventListener('change', async (e) => {
      selectedDeviceId = e.target.value;
      if (engine.isMonitoring) {
        engine.stopMonitoring();
        await engine.startMonitoring(selectedDeviceId);
      } else {
        await engine.capture.connectCamera(selectedDeviceId);
      }
    });

    // Resolution selector
    dom.resolutionSelect?.addEventListener('change', (e) => {
      engine.capture.setResolution(e.target.value);
    });

    // Interval slider
    dom.intervalSlider?.addEventListener('input', (e) => {
      const val = e.target.value;
      if (dom.intervalVal) dom.intervalVal.textContent = `${val}s`;
    });

    // Manual capture
    dom.btnCaptureNow?.addEventListener('click', async () => {
      dom.btnCaptureNow.disabled = true;
      dom.btnCaptureNow.textContent = 'Verifying...';
      await engine.captureAndVerifyNow();
      dom.btnCaptureNow.disabled = false;
      dom.btnCaptureNow.innerHTML = '<span>✦ Capture & Verify Now</span>';
    });

    // Toggle bounding boxes
    dom.btnToggleBoxes?.addEventListener('click', () => {
      showBoundingBoxes = !showBoundingBoxes;
      dom.btnToggleBoxes.classList.toggle('is-active', showBoundingBoxes);
    });

    // Upload test video fallback
    dom.btnUploadFallback?.addEventListener('click', () => {
      dom.fileUploadInput?.click();
    });

    dom.fileUploadInput?.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (file) {
        await engine.capture.loadOfflineVideo(file);
        if (!engine.isMonitoring) {
          await engine.startMonitoring();
        }
      }
    });

    // Environment Selector
    dom.envSelect?.addEventListener('change', async (e) => {
      engine.activeEnvironmentId = e.target.value;
      await refreshAllViews();
    });

    // Category filter chips in Objects View
    document.querySelectorAll('.filter-chip[data-category]').forEach((chip) => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.filter-chip[data-category]').forEach((c) => c.classList.remove('is-active'));
        chip.classList.add('is-active');
        activeCategoryFilter = chip.dataset.category;
        renderObjectsGrid();
      });
    });

    // Event filter chips in Activity View
    document.querySelectorAll('.filter-chip[data-event]').forEach((chip) => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.filter-chip[data-event]').forEach((c) => c.classList.remove('is-active'));
        chip.classList.add('is-active');
        activeEventFilter = chip.dataset.event;
        renderActivityTimeline();
      });
    });

    // Search Execution
    const executeSearch = async (query) => {
      if (!query) return;
      switchTab('search');
      if (dom.searchInput) dom.searchInput.value = query;
      const result = await engine.queryMemory(query);
      renderSearchResult(result);
    };

    dom.btnSearch?.addEventListener('click', () => {
      executeSearch(dom.searchInput?.value);
    });

    dom.searchInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') executeSearch(dom.searchInput?.value);
    });

    dom.quickSearchInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') executeSearch(dom.quickSearchInput?.value);
    });

    // Search suggestion pills
    document.querySelectorAll('.search-prompt-pill').forEach((pill) => {
      pill.addEventListener('click', () => {
        executeSearch(pill.textContent.trim());
      });
    });

    // Drawer close
    dom.drawerCloseBtn?.addEventListener('click', closeDrawer);
    dom.drawerBackdrop?.addEventListener('click', (e) => {
      if (e.target === dom.drawerBackdrop) closeDrawer();
    });
  }

  function switchTab(tabId) {
    activeTab = tabId;
    dom.tabButtons.forEach((btn) => {
      btn.classList.toggle('is-active', btn.dataset.tab === tabId);
    });
    dom.views.forEach((view) => {
      view.classList.toggle('is-active', view.dataset.view === tabId);
    });
  }

  function updateStatusUI(status, detail) {
    if (!dom.hudDot || !dom.hudText) return;

    dom.hudDot.className = 'hud-dot';

    const statusMap = {
      'no-camera': { text: 'NO CAMERA', class: '' },
      'permission-required': { text: 'PERMISSION REQUIRED', class: 'settling' },
      'camera-connected': { text: 'CAMERA CONNECTED', class: 'connected' },
      'camera-unavailable': { text: 'CAMERA UNAVAILABLE', class: '' },
      'camera-disconnected': { text: 'DISCONNECTED', class: '' },
      'monitoring-active': { text: 'MONITORING ACTIVE', class: 'active' },
      'monitoring-paused': { text: 'MONITORING PAUSED', class: '' },
      'processing-error': { text: 'PROCESSING ERROR', class: '' }
    };

    const cfg = statusMap[status] || { text: status.toUpperCase(), class: '' };
    dom.hudText.textContent = cfg.text;
    if (cfg.class) dom.hudDot.classList.add(cfg.class);

    // Update buttons
    const isAct = status === 'monitoring-active';
    if (dom.btnStartMonitoringLabel) {
      dom.btnStartMonitoringLabel.textContent = isAct ? 'Pause Monitoring' : 'Start Monitoring';
    }
    if (dom.btnHeaderAction) {
      dom.btnHeaderAction.innerHTML = isAct
        ? '<span>❚❚ Pause Monitoring</span>'
        : '<span>● Start Monitoring</span>';
    }
  }

  function populateCameraSelect(devices) {
    if (!dom.cameraSourceSelect) return;
    dom.cameraSourceSelect.innerHTML = '';

    if (devices.length === 0) {
      const opt = document.createElement('option');
      opt.textContent = 'No camera found';
      opt.disabled = true;
      dom.cameraSourceSelect.appendChild(opt);
      return;
    }

    devices.forEach((dev) => {
      const opt = document.createElement('option');
      opt.value = dev.deviceId;
      opt.textContent = `${dev.label} [${dev.type}]`;
      dom.cameraSourceSelect.appendChild(opt);
    });

    if (devices.length > 0 && !selectedDeviceId) {
      selectedDeviceId = devices[0].deviceId;
    }
  }

  function updateMotionMeter(score) {
    if (!dom.motionMeterFill || !dom.motionMeterText) return;
    const percent = Math.min(100, Math.round(score * 100 * 4));
    dom.motionMeterFill.style.width = `${percent}%`;

    if (score >= engine.changeDetector.motionThreshold) {
      dom.motionMeterFill.style.background = '#ef4444';
      dom.motionMeterText.textContent = `MOTION DETECTED · ${(score * 100).toFixed(1)}%`;
    } else {
      dom.motionMeterFill.style.background = 'var(--accent-orange)';
      dom.motionMeterText.textContent = `SCENE CALM · ${(score * 100).toFixed(1)}%`;
    }
  }

  function updateSettlingUI(remainingMs, totalMs) {
    if (!dom.hudText || !dom.hudDot) return;
    dom.hudDot.className = 'hud-dot settling';
    dom.hudText.textContent = `SETTLING (${(remainingMs / 1000).toFixed(1)}s)`;
  }

  async function handleNewObservation(deltaResult) {
    console.log('[Workspace] New verified observation committed:', deltaResult);
    await refreshAllViews();

    // Show temporary notification if objects changed
    if (deltaResult.changes && deltaResult.changes.length > 0) {
      const first = deltaResult.changes[0];
      const toast = document.createElement('div');
      toast.className = 'hud-status-pill';
      toast.style.position = 'fixed';
      toast.style.bottom = '28px';
      toast.style.right = '32px';
      toast.style.zIndex = '2000';
      toast.style.background = '#141413';
      toast.style.color = '#F3F0EE';
      toast.innerHTML = `<span class="hud-dot active"></span><span>CHANGE RECORDED: <strong>${first.new_location}</strong></span>`;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 4000);
    }
  }

  async function refreshAllViews() {
    await renderOverviewStats();
    await renderObjectsGrid();
    await renderActivityTimeline();
  }

  async function renderOverviewStats() {
    const envId = engine.activeEnvironmentId;
    const objects = await engine.storage.getAllObjects(envId);
    const events = await engine.storage.getEvents(envId);

    if (dom.statsTotalObjects) dom.statsTotalObjects.textContent = objects.length;
    if (dom.statsRecentChanges) dom.statsRecentChanges.textContent = events.length;

    if (dom.statsLastObsTime) {
      if (events.length > 0) {
        const lastDate = new Date(events[0].timestamp);
        dom.statsLastObsTime.textContent = lastDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else {
        dom.statsLastObsTime.textContent = 'None';
      }
    }

    // Render Recent 3 Verified Changes
    if (dom.recentEventsOverview) {
      const recent = events.slice(0, 3);
      if (recent.length === 0) {
        dom.recentEventsOverview.innerHTML = `<li style="color: var(--slate-gray); font-size: 13px;">No physical changes recorded yet.</li>`;
      } else {
        dom.recentEventsOverview.innerHTML = recent
          .map((evt) => {
            const obj = objects.find((o) => o.object_id === evt.object_id);
            const name = obj ? obj.canonical_name : 'Object';
            const timeStr = new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            return `
              <li class="recent-event-item">
                <span class="event-type-badge ${evt.event_type}">${evt.event_type}</span>
                <div class="event-item-content">
                  <div class="event-item-title">${name}</div>
                  <div class="event-item-route">
                    ${evt.previous_location ? `<span>${evt.previous_location}</span> <span aria-hidden="true">→</span>` : ''}
                    <strong>${evt.new_location}</strong>
                  </div>
                </div>
                <div class="event-item-time">${timeStr}</div>
              </li>
            `;
          })
          .join('');
      }
    }

    // Render Preview of Objects in Overview
    if (dom.objectsGridOverview) {
      const topObjects = objects.slice(0, 3);
      dom.objectsGridOverview.innerHTML = '';
      for (const obj of topObjects) {
        const card = document.createElement('div');
        card.className = 'object-card';

        let mediaHtml = `<div style="font-family: var(--font-mono); font-size: 11px; color: rgba(255,255,255,0.4);">NO EVIDENCE FRAME</div>`;
        if (obj.evidence_frame_ref) {
          const frame = await engine.storage.getEvidenceFrame(obj.evidence_frame_ref);
          if (frame && frame.data_url) {
            mediaHtml = `<img src="${frame.data_url}" alt="${obj.canonical_name}" loading="lazy"/>`;
          }
        }

        card.innerHTML = `
          <div class="object-card-media">
            ${mediaHtml}
            <span class="object-status-badge ${obj.status}">${obj.status}</span>
          </div>
          <div class="object-card-body">
            <div class="object-card-category">${obj.category} · ${Math.round(obj.confidence * 100)}% CONFIDENCE</div>
            <h3 class="object-card-title">${obj.canonical_name}</h3>
            <div class="object-card-location">
              <span style="color: var(--accent-orange);">📍</span>
              <span>${obj.current_location}</span>
            </div>
            <div class="object-card-footer">
              <span class="object-card-time">Verified ${formatTimeAgo(new Date(obj.last_seen))}</span>
              <button class="btn-inspect-history" type="button" data-object-id="${obj.object_id}">
                <span>Inspect History</span>
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>
        `;

        card.querySelector('.btn-inspect-history')?.addEventListener('click', () => {
          openObjectDrawer(obj.object_id);
        });

        dom.objectsGridOverview.appendChild(card);
      }
    }
  }

  async function renderObjectsGrid() {
    if (!dom.objectsGrid) return;
    const envId = engine.activeEnvironmentId;
    let objects = await engine.storage.getAllObjects(envId);

    if (activeCategoryFilter !== 'all') {
      objects = objects.filter((o) => o.category === activeCategoryFilter);
    }

    if (objects.length === 0) {
      dom.objectsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 40px; text-align: center; color: var(--slate-gray);">
          No physical objects tracked in this category yet.
        </div>
      `;
      return;
    }

    dom.objectsGrid.innerHTML = '';
    for (const obj of objects) {
      const card = document.createElement('div');
      card.className = 'object-card';

      let mediaHtml = `<div style="font-family: var(--font-mono); font-size: 11px; color: rgba(255,255,255,0.4);">NO EVIDENCE FRAME</div>`;
      if (obj.evidence_frame_ref) {
        const frame = await engine.storage.getEvidenceFrame(obj.evidence_frame_ref);
        if (frame && frame.data_url) {
          mediaHtml = `<img src="${frame.data_url}" alt="${obj.canonical_name}" loading="lazy"/>`;
        }
      }

      card.innerHTML = `
        <div class="object-card-media">
          ${mediaHtml}
          <span class="object-status-badge ${obj.status}">${obj.status}</span>
        </div>
        <div class="object-card-body">
          <div class="object-card-category">${obj.category} · ${Math.round(obj.confidence * 100)}% CONFIDENCE</div>
          <h3 class="object-card-title">${obj.canonical_name}</h3>
          <div class="object-card-location">
            <span style="color: var(--accent-orange);">📍</span>
            <span>${obj.current_location}</span>
          </div>
          <div class="object-card-footer">
            <span class="object-card-time">Verified ${formatTimeAgo(new Date(obj.last_seen))}</span>
            <button class="btn-inspect-history" type="button" data-object-id="${obj.object_id}">
              <span>Inspect History</span>
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      `;

      card.querySelector('.btn-inspect-history')?.addEventListener('click', () => {
        openObjectDrawer(obj.object_id);
      });

      dom.objectsGrid.appendChild(card);
    }
  }

  async function renderActivityTimeline() {
    if (!dom.timelineList) return;
    const envId = engine.activeEnvironmentId;
    let events = await engine.storage.getEvents(envId);
    const objects = await engine.storage.getAllObjects(envId);

    if (activeEventFilter !== 'all') {
      events = events.filter((e) => e.event_type === activeEventFilter);
    }

    if (events.length === 0) {
      dom.timelineList.innerHTML = `<li style="padding: 20px; color: var(--slate-gray);">No physical events recorded for this filter.</li>`;
      return;
    }

    dom.timelineList.innerHTML = '';
    for (const evt of events) {
      const obj = objects.find((o) => o.object_id === evt.object_id);
      const name = obj ? obj.canonical_name : 'Physical Object';
      const timeStr = new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      let thumbHtml = '';
      if (evt.frame_reference) {
        const frame = await engine.storage.getEvidenceFrame(evt.frame_reference);
        if (frame && frame.data_url) {
          thumbHtml = `<div class="node-thumbnail-preview"><img src="${frame.data_url}" alt="Evidence"/></div>`;
        }
      }

      const li = document.createElement('li');
      li.className = 'timeline-node-item';
      li.innerHTML = `
        <div class="timeline-node-dot"></div>
        <div class="timeline-node-box">
          <div style="flex: 1;">
            <div class="node-title-row">
              <span class="event-type-badge ${evt.event_type}">${evt.event_type}</span>
              <span class="node-object-name">${name}</span>
            </div>
            <div class="node-route-delta">
              ${evt.previous_location ? `<span>${evt.previous_location}</span> <span class="arrow">→</span>` : ''}
              <strong>${evt.new_location}</strong>
            </div>
            <div class="node-meta-time">Verified ${timeStr} · ${(evt.confidence * 100).toFixed(0)}% confidence</div>
          </div>
          ${thumbHtml}
        </div>
      `;
      dom.timelineList.appendChild(li);
    }
  }

  function renderSearchResult(res) {
    if (!dom.searchResultContainer) return;

    if (!res.success) {
      dom.searchResultContainer.innerHTML = `
        <div class="evidence-reveal-card" style="padding: 30px; text-align: center; color: var(--slate-gray);">
          ${res.message || 'No matching physical records found.'}
        </div>
      `;
      return;
    }

    if (res.queryType === 'object_evidence_reveal') {
      const obj = res.object;
      let evidenceImg = '';
      if (res.evidence && res.evidence.data_url) {
        evidenceImg = `<img src="${res.evidence.data_url}" alt="${obj.canonical_name} evidence"/>`;
      } else {
        evidenceImg = `<div style="color: rgba(255,255,255,0.4); font-family: var(--font-mono); font-size: 11px;">NO RETAINED EVIDENCE SNAPSHOT</div>`;
      }

      const historyItems = (res.movementHistory || [])
        .map(
          (h) => `
          <li style="padding: 10px 0; border-bottom: 1px solid var(--line-border); font-size: 13.5px;">
            <div style="font-family: var(--font-mono); font-size: 11px; color: var(--slate-gray); margin-bottom: 2px;">
              ${new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · ${h.event_type.toUpperCase()}
            </div>
            <div>${h.previous_location ? `${h.previous_location} → ` : ''}<strong>${h.new_location}</strong></div>
          </li>
        `
        )
        .join('');

      dom.searchResultContainer.innerHTML = `
        <div class="evidence-reveal-card">
          <div class="reveal-card-header">
            <div>
              <div style="font-family: var(--font-mono); font-size: 11px; color: var(--slate-gray); text-transform: uppercase; margin-bottom: 4px;">
                DETERMINISTIC SPATIAL MEMORY RESULT
              </div>
              <h2 class="reveal-object-title">${obj.canonical_name}</h2>
              <div class="reveal-last-location">📍 ${res.lastKnownLocation}</div>
              <div class="reveal-meta-sub">
                Last seen ${res.lastSeenHuman} · ${res.confidencePercent}% confidence · Status: ${res.status.toUpperCase()}
              </div>
              ${res.isStale ? `<div style="color: #b45309; font-size: 12px; margin-top: 6px;">⚠️ ${res.stalenessNote}</div>` : ''}
            </div>
            <button class="btn-pill-outline" type="button" id="btnRevealInspectFull">View Full Timeline</button>
          </div>
          <div class="reveal-media-stage">
            ${evidenceImg}
          </div>
          <div class="reveal-history-section">
            <div class="reveal-history-title">Verified Movement Chronology</div>
            <ul style="list-style: none; padding: 0; margin: 0;">
              ${historyItems || '<li style="color: var(--slate-gray); font-size: 13px;">No prior movement events recorded.</li>'}
            </ul>
          </div>
        </div>
      `;

      document.getElementById('btnRevealInspectFull')?.addEventListener('click', () => {
        openObjectDrawer(obj.object_id);
      });
    }
  }

  async function openObjectDrawer(objectId) {
    const obj = await engine.storage.getObject(objectId);
    if (!obj || !dom.drawerBackdrop) return;

    dom.drawerTitle.textContent = obj.canonical_name;
    dom.drawerSubtitle.textContent = `${obj.category.toUpperCase()} · CURRENT: ${obj.current_location}`;

    const events = await engine.storage.getEvents(engine.activeEnvironmentId, { objectId });
    const rels = await engine.storage.getRelationshipsForObject(objectId, engine.activeEnvironmentId);

    let frameImg = '';
    if (obj.evidence_frame_ref) {
      const frame = await engine.storage.getEvidenceFrame(obj.evidence_frame_ref);
      if (frame && frame.data_url) {
        frameImg = `<div style="width: 100%; aspect-ratio: 16/9; background: #141820; border-radius: 12px; overflow: hidden; margin-bottom: 24px;"><img src="${frame.data_url}" style="width: 100%; height: 100%; object-fit: contain;"/></div>`;
      }
    }

    const eventList = events
      .map((e, idx) => `
        <div style="display: flex; gap: 14px; margin-bottom: 18px;">
          <div style="font-family: var(--font-mono); font-size: 11px; color: var(--accent-orange); font-weight: 600; width: 24px;">0${idx + 1}</div>
          <div style="flex: 1;">
            <div style="font-family: var(--font-mono); font-size: 11px; color: var(--slate-gray);">
              ${new Date(e.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div style="font-size: 14px; font-weight: 500; color: var(--ink-black); margin-top: 2px;">
              ${e.previous_location ? `${e.previous_location} → ` : ''}<strong>${e.new_location}</strong>
            </div>
            <div style="font-size: 12px; color: #78716c;">Verified with ${(e.confidence * 100).toFixed(0)}% confidence</div>
          </div>
        </div>
      `)
      .join('');

    dom.drawerBody.innerHTML = `
      ${frameImg}
      <div style="margin-bottom: 24px; padding: 16px; background: var(--pure-white); border: 1px solid var(--line-border); border-radius: 12px;">
        <div style="font-family: var(--font-mono); font-size: 11px; color: var(--slate-gray); text-transform: uppercase; margin-bottom: 6px;">Spatial Anchors</div>
        <div style="font-size: 13.5px; color: var(--charcoal);">
          ${rels.map((r) => `<div>✦ ${r.relation} ${r.reference_object_id}</div>`).join('') || 'Aligned relative to primary desk coordinate frame.'}
        </div>
      </div>
      <h4 style="font-family: var(--font-body); font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--slate-gray); margin: 0 0 16px;">
        Chronological Movement History
      </h4>
      <div>${eventList || '<div style="color: var(--slate-gray); font-size: 13.5px;">No recorded movement deltas.</div>'}</div>
    `;

    dom.drawerBackdrop.classList.add('is-open');
  }

  function closeDrawer() {
    dom.drawerBackdrop?.classList.remove('is-open');
  }

  // Real-time canvas overlay bounding box renderer
  function startOverlayLoop() {
    const canvas = dom.overlayCanvas;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const render = () => {
      const v = dom.video;
      if (v && v.videoWidth && canvas) {
        if (canvas.width !== v.videoWidth || canvas.height !== v.videoHeight) {
          canvas.width = v.videoWidth;
          canvas.height = v.videoHeight;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (showBoundingBoxes && engine && engine.isMonitoring) {
          // Draw subtle alignment crosshair at center
          const cx = canvas.width / 2;
          const cy = canvas.height / 2;
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
          ctx.lineWidth = 1;
          ctx.setLineDash([4, 4]);
          ctx.strokeRect(canvas.width * 0.1, canvas.height * 0.1, canvas.width * 0.8, canvas.height * 0.8);
          ctx.setLineDash([]);
        }
      }
      requestAnimationFrame(render);
    };
    requestAnimationFrame(render);
  }

  function formatTimeAgo(date) {
    const sec = Math.floor((new Date() - date) / 1000);
    if (sec < 60) return 'just now';
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}m ago`;
    const hr = Math.floor(min / 60);
    return `${hr}h ago`;
  }

  // Boot on ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
