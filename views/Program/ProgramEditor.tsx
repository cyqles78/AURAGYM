import React, { useState } from 'react';
import { ArrowLeft, Plus, Save, Trash2, Calendar, ChevronDown, ChevronRight, ChevronUp, Edit2, GripVertical, Copy } from 'lucide-react';
import { Program, ProgramDay, ProgramWeek } from '../../types';
import { GlassCard } from '../../components/GlassCard';

interface ProgramEditorProps {
  initialProgram: Program;
  onSave: (program: Program) => void;
  onBack: () => void;
  onEditDay: (weekIndex: number, dayIndex: number, day: ProgramDay) => void;
}

export const ProgramEditor: React.FC<ProgramEditorProps> = ({ 
  initialProgram, 
  onSave, 
  onBack,
  onEditDay 
}) => {
  const [program, setProgram] = useState<Program>(initialProgram);
  const [expandedWeek, setExpandedWeek] = useState<number>(0);

  const updateProgram = (updates: Partial<Program>) => {
    setProgram(prev => ({ ...prev, ...updates }));
  };

  const addWeek = () => {
    setProgram(prev => ({
      ...prev,
      durationWeeks: prev.durationWeeks + 1,
      weeks: [
        ...prev.weeks,
        {
          number: prev.weeks.length + 1,
          days: []
        }
      ]
    }));
    setExpandedWeek(program.weeks.length); // Open the new week
  };

  const addDayToWeek = (weekIndex: number) => {
    const newDay: ProgramDay = {
      id: `day_${Date.now()}_${Math.random()}`,
      name: `Day ${program.weeks[weekIndex].days.length + 1}`,
      focus: 'General',
      sessionDuration: '45 min',
      exercises: []
    };

    const newWeeks = [...program.weeks];
    newWeeks[weekIndex].days.push(newDay);
    setProgram(prev => ({ ...prev, weeks: newWeeks }));
  };

  const removeDay = (weekIndex: number, dayIndex: number) => {
    const newWeeks = [...program.weeks];
    newWeeks[weekIndex].days.splice(dayIndex, 1);
    setProgram(prev => ({ ...prev, weeks: newWeeks }));
  };

  const duplicateWeek = (weekIndex: number) => {
      const weekToCopy = program.weeks[weekIndex];
      const newWeek: ProgramWeek = {
          ...JSON.parse(JSON.stringify(weekToCopy)),
          number: program.weeks.length + 1
      };
      
      // Regenerate IDs for days
      newWeek.days = newWeek.days.map(d => ({
          ...d,
          id: `day_${Date.now()}_${Math.random()}`
      }));

      setProgram(prev => ({
          ...prev,
          durationWeeks: prev.durationWeeks + 1,
          weeks: [...prev.weeks, newWeek]
      }));
  };

  return (
    <div className="pb-28 pt-6 space-y-6 h-screen flex flex-col bg-black">
      {/* Header */}
      <div className="flex items-center justify-between px-2 flex-shrink-0">
        <div className="flex items-center space-x-2">
            <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-white/10 text-white">
                <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold text-white">Edit Program</h1>
        </div>
        <button 
            onClick={() => onSave(program)}
            className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-full text-xs font-bold hover:bg-gray-200 transition"
        >
            <Save size={16} /> Save
        </button>
      </div>

      {/* Program Meta */}
      <GlassCard className="space-y-4 flex-shrink-0 mx-2">
          <div>
              <label className="text-[10px] text-secondary font-bold uppercase tracking-wider mb-1 block">Program Name</label>
              <input 
                  type="text" 
                  value={program.name}
                  onChange={(e) => updateProgram({ name: e.target.value })}
                  className="w-full bg-transparent border-b border-white/20 pb-2 text-lg font-bold text-white outline-none focus:border-white transition-colors"
                  placeholder="e.g. Summer Shred"
              />
          </div>
          <div className="flex gap-4">
              <div className="flex-1">
                  <label className="text-[10px] text-secondary font-bold uppercase tracking-wider mb-1 block">Goal</label>
                  <select 
                      value={program.goal}
                      onChange={(e) => updateProgram({ goal: e.target.value })}
                      className="w-full bg-[#1C1C1E] text-white text-sm py-2 rounded-lg outline-none"
                  >
                      <option>Hypertrophy</option>
                      <option>Strength</option>
                      <option>Endurance</option>
                      <option>Custom</option>
                  </select>
              </div>
              <div className="flex-1">
                  <label className="text-[10px] text-secondary font-bold uppercase tracking-wider mb-1 block">Duration</label>
                  <p className="text-sm font-bold text-white py-2">{program.weeks.length} Weeks</p>
              </div>
          </div>
      </GlassCard>

      {/* Weeks & Days List */}
      <div className="flex-1 overflow-y-auto px-2 space-y-4 pb-20">
          {program.weeks.map((week, wIdx) => (
              <div key={wIdx} className="space-y-2">
                  <div 
                    onClick={() => setExpandedWeek(expandedWeek === wIdx ? -1 : wIdx)}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 cursor-pointer"
                  >
                      <div className="flex items-center gap-2">
                          {expandedWeek === wIdx ? <ChevronDown size={16} className="text-secondary"/> : <ChevronRight size={16} className="text-secondary"/>}
                          <h3 className="text-sm font-bold text-white">Week {week.number}</h3>
                          <span className="text-xs text-secondary">({week.days.length} days)</span>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); duplicateWeek(wIdx); }}
                        className="p-1.5 text-secondary hover:text-white"
                        title="Duplicate Week"
                      >
                          <Copy size={14} />
                      </button>
                  </div>

                  {expandedWeek === wIdx && (
                      <div className="space-y-3 pl-4 border-l border-white/10 ml-3">
                          {week.days.map((day, dIdx) => (
                              <GlassCard 
                                  key={day.id} 
                                  className="!p-4 active:scale-[0.99] transition-transform cursor-pointer group"
                                  onClick={() => onEditDay(wIdx, dIdx, day)}
                              >
                                  <div className="flex justify-between items-center">
                                      <div>
                                          <div className="flex items-center gap-2 mb-1">
                                              <h4 className="font-bold text-white text-base">{day.name}</h4>
                                              <Edit2 size={12} className="text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                                          </div>
                                          <p className="text-xs text-secondary">{day.focus || 'No Focus'} • {day.exercises.length} Exercises</p>
                                      </div>
                                      <button 
                                          onClick={(e) => { e.stopPropagation(); removeDay(wIdx, dIdx); }}
                                          className="p-2 text-secondary hover:text-red-400 transition"
                                      >
                                          <Trash2 size={16} />
                                      </button>
                                  </div>
                              </GlassCard>
                          ))}
                          
                          <button 
                              onClick={() => addDayToWeek(wIdx)}
                              className="w-full py-3 rounded-2xl border-2 border-dashed border-white/10 text-secondary text-xs font-bold hover:bg-white/5 hover:border-white/20 transition flex items-center justify-center gap-2"
                          >
                              <Plus size={14} /> Add Day
                          </button>
                      </div>
                  )}
              </div>
          ))}

          <button 
              onClick={addWeek}
              className="w-full py-4 bg-surfaceHighlight text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-white/20 transition"
          >
              <Calendar size={16} /> Add Week
          </button>
      </div>
    </div>
  );
};