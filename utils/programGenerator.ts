import { Program, ProgramWeek, ProgramDay, WorkoutSet } from '../types';
import { PROGRAM_TEMPLATES, getExercisesForTemplate } from '../data/programTemplates';

export interface ProgramInput {
    goal: string;          // 'Hypertrophy', 'Strength', 'Endurance'
    daysPerWeek: number;
    durationWeeks: number;
    programName?: string;
    level: string;
}

// --- CONFIGURATORS ---

const getVolumeSettings = (goal: string) => {
    switch (goal) {
        case 'Strength':
            return { sets: 5, reps: '5', rest: 180 };
        case 'Endurance':
            return { sets: 3, reps: '15', rest: 60 };
        case 'Hypertrophy':
        default:
            return { sets: 4, reps: '10', rest: 90 };
    }
};

const createSet = (reps: string): WorkoutSet => ({
    id: Math.random().toString(36).substr(2, 9),
    reps,
    weight: '0',
    completed: false
});

// --- GENERATOR ENGINE ---

export const generateLocalProgram = (input: ProgramInput): Program => {
    // 1. Select Best Template
    let template = PROGRAM_TEMPLATES.find(t => t.id === 'full_body'); // Default

    if (input.daysPerWeek >= 5) {
        template = PROGRAM_TEMPLATES.find(t => t.id === 'ppl') || template;
    } else if (input.daysPerWeek === 4) {
        template = PROGRAM_TEMPLATES.find(t => t.id === 'upper_lower') || template;
    }

    if (!template) throw new Error("No suitable template found");

    // 2. Configure Volume based on Goal
    const volume = getVolumeSettings(input.goal);

    // 3. Construct Weeks
    const weeks: ProgramWeek[] = [];

    for (let w = 1; w <= input.durationWeeks; w++) {
        const days: ProgramDay[] = [];
        
        // Loop through the requested number of days per week
        for (let d = 0; d < input.daysPerWeek; d++) {
            // Cycle through template structure (modulo to repeat if daysPerWeek > template days)
            const templateDay = template.structure[d % template.structure.length];
            const exercises = getExercisesForTemplate(templateDay.exercises);

            // Hydrate exercises with sets/reps
            const hydratedExercises = exercises.map(ex => ({
                ...ex,
                id: `prog_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`, // Unique instance ID
                restTimeSeconds: volume.rest,
                sets: Array(volume.sets).fill(null).map(() => createSet(volume.reps))
            }));

            days.push({
                id: `day_${w}_${d}_${Date.now()}`,
                name: templateDay.dayName,
                focus: templateDay.focus,
                sessionDuration: `${hydratedExercises.length * 5 + 10} min`,
                exercises: hydratedExercises
            });
        }

        weeks.push({
            number: w,
            days
        });
    }

    // 4. Final Assembly
    return {
        id: `program_${Date.now()}`,
        name: input.programName || `${template.name} (${input.goal})`,
        description: template.description,
        goal: input.goal,
        durationWeeks: input.durationWeeks,
        daysPerWeek: input.daysPerWeek,
        createdAt: new Date().toISOString(),
        weeks
    };
};

export const createEmptyProgram = (): Program => {
    return {
        id: `manual_${Date.now()}`,
        name: 'New Custom Program',
        description: 'Manually created routine',
        goal: 'Custom',
        durationWeeks: 4,
        daysPerWeek: 3,
        createdAt: new Date().toISOString(),
        weeks: [
            {
                number: 1,
                days: [
                    {
                        id: `day_1_1_${Date.now()}`,
                        name: 'Day 1',
                        focus: 'Full Body',
                        sessionDuration: '45 min',
                        exercises: []
                    }
                ]
            }
        ]
    };
};
