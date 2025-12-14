import { Exercise } from '../types';
import { DEFAULT_EXERCISES } from '../services/DataService';

// Helper to find a default exercise or create a placeholder
const getEx = (idOrName: string): Exercise => {
    const found = DEFAULT_EXERCISES.find(e => e.id === idOrName || e.name === idOrName);
    if (found) return JSON.parse(JSON.stringify(found)); // Return copy
    
    // Placeholder if not found
    return {
        id: `placeholder_${Math.random()}`,
        name: idOrName,
        targetMuscle: 'Full Body',
        equipment: 'Barbell',
        sets: [],
        restTimeSeconds: 60
    };
};

export interface ProgramTemplate {
    id: string;
    name: string;
    description: string;
    minDays: number;
    maxDays: number;
    structure: {
        dayName: string;
        focus: string;
        exercises: string[]; // IDs or Names
    }[];
}

export const PROGRAM_TEMPLATES: ProgramTemplate[] = [
    {
        id: 'full_body',
        name: 'Full Body Foundations',
        description: 'High frequency, compound movement focus. Perfect for beginners or busy schedules.',
        minDays: 2,
        maxDays: 3,
        structure: [
            {
                dayName: 'Day A',
                focus: 'Squat & Push Focus',
                exercises: ['def_squat', 'def_bench_press', 'def_bb_row', 'def_ohp', 'def_bicep_curl']
            },
            {
                dayName: 'Day B',
                focus: 'Hinge & Pull Focus',
                exercises: ['def_deadlift', 'def_pull_up', 'def_lunge', 'def_incline_db_press', 'def_tricep_ext']
            },
            {
                dayName: 'Day C',
                focus: 'Hypertrophy Mix',
                exercises: ['def_leg_press', 'def_lat_raise', 'def_cable_fly', 'def_rdl', 'Plank']
            }
        ]
    },
    {
        id: 'upper_lower',
        name: 'Upper / Lower Split',
        description: 'Balanced split separating upper body and lower body days to maximize recovery.',
        minDays: 4,
        maxDays: 4,
        structure: [
            {
                dayName: 'Upper A',
                focus: 'Strength Focus',
                exercises: ['def_bench_press', 'def_bb_row', 'def_ohp', 'def_pull_up', 'def_bicep_curl']
            },
            {
                dayName: 'Lower A',
                focus: 'Squat Pattern',
                exercises: ['def_squat', 'def_lunge', 'def_leg_press', 'Calf Raise', 'Plank']
            },
            {
                dayName: 'Upper B',
                focus: 'Hypertrophy Focus',
                exercises: ['def_incline_db_press', 'def_lat_raise', 'def_tricep_ext', 'def_cable_fly', 'def_bicep_curl']
            },
            {
                dayName: 'Lower B',
                focus: 'Hinge Pattern',
                exercises: ['def_deadlift', 'def_rdl', 'def_lunge', 'Leg Curl', 'Crunch']
            }
        ]
    },
    {
        id: 'ppl',
        name: 'Push / Pull / Legs',
        description: 'The gold standard for advanced hypertrophy. Dedicated days for pushing, pulling, and legs.',
        minDays: 5,
        maxDays: 6,
        structure: [
            {
                dayName: 'Push A',
                focus: 'Chest & Front Delts',
                exercises: ['def_bench_press', 'def_ohp', 'def_incline_db_press', 'def_lat_raise', 'def_tricep_ext']
            },
            {
                dayName: 'Pull A',
                focus: 'Back Thickness & Biceps',
                exercises: ['def_deadlift', 'def_bb_row', 'def_pull_up', 'def_bicep_curl', 'Face Pull']
            },
            {
                dayName: 'Legs A',
                focus: 'Quad Dominant',
                exercises: ['def_squat', 'def_leg_press', 'def_lunge', 'Leg Extension', 'Calf Raise']
            },
            {
                dayName: 'Push B',
                focus: 'Shoulders & Triceps',
                exercises: ['def_ohp', 'def_incline_db_press', 'Dips', 'def_lat_raise', 'def_cable_fly']
            },
            {
                dayName: 'Pull B',
                focus: 'Back Width & Rear Delts',
                exercises: ['def_pull_up', 'Lat Pulldown', 'def_bb_row', 'Hammer Curl', 'Rear Delt Fly']
            },
            {
                dayName: 'Legs B',
                focus: 'Hamstring & Glute',
                exercises: ['def_rdl', 'def_lunge', 'Leg Curl', 'Glute Bridge', 'Plank']
            }
        ]
    }
];

export const getExercisesForTemplate = (exerciseIds: string[]): Exercise[] => {
    return exerciseIds.map(getEx);
};
