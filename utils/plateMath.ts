
export interface PlateCalculation {
  plates: number[];
  remainder: number;
  closestValidWeight: number;
}

const STANDARD_PLATES = [25, 20, 15, 10, 5, 2.5, 1.25];

export const calculatePlates = (targetWeight: number, barWeight: number = 20): PlateCalculation => {
  // 1. Safety check
  if (targetWeight <= barWeight) {
    return { plates: [], remainder: 0, closestValidWeight: barWeight };
  }

  // 2. Determine weight needed per side
  let weightPerSide = (targetWeight - barWeight) / 2;
  const plates: number[] = [];

  // 3. Greedy algorithm
  for (const plate of STANDARD_PLATES) {
    while (weightPerSide >= plate) {
      plates.push(plate);
      weightPerSide -= plate;
      // Handle floating point precision (e.g. 1.25 not fitting into 1.2499999)
      weightPerSide = Math.round(weightPerSide * 100) / 100;
    }
  }

  // 4. Calculate results
  const loadedWeight = barWeight + (plates.reduce((a, b) => a + b, 0) * 2);
  
  return {
    plates, // Plates for ONE side
    remainder: weightPerSide * 2, // Total remainder for both sides
    closestValidWeight: loadedWeight
  };
};
