// =============================================================================
// SMRITI / PHANTOM — Spline 3D Scene Alignment & Setup DSL Script
// Run this DSL in Spline editor (via Spline Code panel or MCP 3d_run_code)
// to recreate the front-stage architectural composition.
// =============================================================================

// 1. Ground & Rug Alignment
select('Room_Rug'); 
position({ x: 0, y: 2, z: -30 }); 
geometry({ width: 400, depth: 320 });

// 2. Credenza / Cabinet (Flush against back wall on the left)
select('Cabinet_Body'); 
position({ x: -125, y: 25, z: -225 }); 
rotation({ x: 0, y: 0, z: 0 }); 
geometry({ width: 80, height: 40, depth: 30 });

// 3. Credenza Lamp & Accents
select('Lamp_Rod'); 
position({ x: -150, y: 55, z: -225 }); 
rotation({ x: 0, y: 0, z: 0 });

select('Lamp_Shade'); 
position({ x: -150, y: 68, z: -225 }); 
rotation({ x: 0, y: 0, z: 0 });

select('Lamp_Interior_Light'); 
position({ x: -150, y: 68, z: -220 });

select('Key_Tray'); 
position({ x: -100, y: 46, z: -225 }); 
rotation({ x: 0, y: 0, z: 0 });

select('Keys_Ring'); 
position({ x: -100, y: 47, z: -225 }); 
rotation({ x: 90, y: 0, z: 0 });

// 4. Framed Wall Art (Centered directly above credenza)
select('Frame_Border'); 
position({ x: -125, y: 160, z: -241 });

select('Frame_Canvas'); 
position({ x: -125, y: 160, z: -239 });

select('Frame_Art_Sun'); 
position({ x: -125, y: 160, z: -238 });

// 5. Armchair (Midground, orthogonal architectural alignment)
select('Chair_Seat'); 
position({ x: -55, y: 15, z: -40 }); 
rotation({ x: 0, y: 0, z: 0 });

select('Chair_Backrest'); 
position({ x: -55, y: 44, z: -65 }); 
rotation({ x: 0, y: 0, z: 0 });

select('Chair_Arm_L'); 
position({ x: -85, y: 28, z: -40 }); 
rotation({ x: 0, y: 0, z: 0 });

select('Chair_Arm_R'); 
position({ x: -25, y: 28, z: -40 }); 
rotation({ x: 0, y: 0, z: 0 });

select('Chair_Cushion_Olive'); 
position({ x: -55, y: 28, z: -58 }); 
rotation({ x: -10, y: 0, z: 0 });

// 6. Round Side Table (Flush beside armchair, NOT protruding into aisle)
select('SideTable_Top'); 
position({ x: -115, y: 50, z: -40 }); 
rotation({ x: 0, y: 0, z: 0 });

select('SideTable_Leg1'); 
position({ x: -128, y: 25, z: -48 }); 
rotation({ x: -5, y: 0, z: 8 });

select('SideTable_Leg2'); 
position({ x: -102, y: 25, z: -48 }); 
rotation({ x: -5, y: 0, z: -8 });

select('SideTable_Leg3'); 
position({ x: -115, y: 25, z: -28 }); 
rotation({ x: 9, y: 0, z: 0 });

// Table props & Reading Glasses
select('Ceramic_Mug'); 
position({ x: -125, y: 55.5, z: -45 });

select('Medicine_Box'); 
position({ x: -105, y: 54.5, z: -48 });

select('Medicine_Box_Label'); 
position({ x: -105, y: 57.2, z: -48 });

select('Glasses_Group'); 
position({ x: -115, y: 53.5, z: -35 }); 
rotation({ x: 0, y: 0, z: 0 });

select('Ghost_Glasses_Group'); 
position({ x: -115, y: 53.5, z: -35 }); 
rotation({ x: 0, y: 0, z: 0 });

select('Highlight_Ghost_Ring'); 
position({ x: -115, y: 51.5, z: -35 }); 
rotation({ x: 90, y: 0, z: 0 });

// 7. Open Bookshelf (Flush against back wall on the right)
select('Bookshelf_Back'); 
position({ x: 130, y: 80, z: -235 });

select('Bookshelf_Top'); 
position({ x: 130, y: 160, z: -218 });

select('Bookshelf_Side_L'); 
position({ x: 95, y: 80, z: -218 });

select('Bookshelf_Side_R'); 
position({ x: 165, y: 80, z: -218 });

select('Bookshelf_Shelf_1'); 
position({ x: 130, y: 50, z: -218 });

select('Bookshelf_Shelf_2'); 
position({ x: 130, y: 90, z: -218 });

select('Bookshelf_Shelf_3'); 
position({ x: 130, y: 130, z: -218 });

select('Book_1'); 
position({ x: 106, y: 103, z: -218 });

select('Book_2'); 
position({ x: 114, y: 104, z: -218 });

select('Book_3'); 
position({ x: 148, y: 105, z: -218 });

select('Book_4'); 
position({ x: 156, y: 102, z: -218 });

select('Highlight_Moved_Ring'); 
position({ x: 130, y: 92, z: -218 }); 
rotation({ x: 90, y: 0, z: 0 });

// 8. Hero Character (Center Stage)
select('Character'); 
position({ x: 15, y: 68, z: 20 }); 
rotation({ x: 0, y: -6, z: 0 });

// 9. Camera Preset (Architectural Front-Stage Framing)
select('Camera_Home'); 
position({ x: 10, y: 155, z: 420 }); 
rotation({ x: -10, y: 0, z: 0 });
