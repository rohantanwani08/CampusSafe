export const BUILDINGS = [
  {
    id: 'admin-block',
    name: 'Admin Block',
    svg: {
      x: 100, y: 150, width: 220, height: 180,
      textX: 210, textY: 240
    }
  },
  {
    id: 'library',
    name: 'Library',
    svg: {
      x: 450, y: 100, width: 300, height: 250,
      textX: 600, textY: 225
    }
  },
  {
    id: 'academic-1',
    name: 'Academic Block 1',
    svg: {
      x: 150, y: 400, width: 250, height: 200,
      textX: 275, textY: 500
    }
  },
  {
    id: 'academic-2',
    name: 'Academic Block 2',
    svg: {
      x: 450, y: 400, width: 250, height: 200,
      textX: 575, textY: 500
    }
  },
  {
    id: 'hostel-a',
    name: 'Hostel A',
    svg: {
      x: 820, y: 150, width: 180, height: 140,
      textX: 910, textY: 220
    }
  },
  {
    id: 'hostel-b',
    name: 'Hostel B',
    svg: {
      x: 820, y: 320, width: 180, height: 140,
      textX: 910, textY: 390
    }
  },
  {
    id: 'cafeteria',
    name: 'Cafeteria',
    svg: {
      x: 750, y: 500, width: 250, height: 120,
      textX: 875, textY: 560
    }
  },
  {
    id: 'sports-complex',
    name: 'Sports Complex',
    svg: {
      x: 50, y: 50, width: 200, height: 70,
      textX: 150, textY: 85
    }
  }
];

export const PATHS = [
  "M 320 240 L 450 225", // Admin to Library
  "M 275 400 L 210 330", // Acad1 to Admin
  "M 450 500 L 400 500 L 400 350", // Acad2 to middle
  "M 750 225 L 820 220", // Library to Hostel A
  "M 750 350 L 820 390", // Library to Hostel B
  "M 700 560 L 750 560", // Acad2 to Cafe
  "M 600 350 L 600 400"  // Library to Acad2
];

export const GREEN_AREAS = [
  { x: 350, y: 280, width: 70, height: 100, rx: 35 },
  { x: 50, y: 620, width: 250, height: 60, rx: 20 }
];
