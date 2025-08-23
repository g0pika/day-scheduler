import { PeriodCycle } from '../types';

export const calculateAverageCycle = (cycles: PeriodCycle[]): number => {
  if (cycles.length < 2) return 28; // Default cycle length
  
  const validCycles = cycles.filter(c => c.cycleLength);
  if (validCycles.length === 0) return 28;
  
  const sum = validCycles.reduce((acc, cycle) => acc + (cycle.cycleLength || 0), 0);
  return Math.round(sum / validCycles.length);
};

export const predictNextPeriod = (cycles: PeriodCycle[]): Date | null => {
  if (cycles.length === 0) return null;
  
  const lastCycle = cycles[cycles.length - 1];
  if (!lastCycle.startDate) return null;
  
  const averageCycleLength = calculateAverageCycle(cycles);
  const nextDate = new Date(lastCycle.startDate);
  nextDate.setDate(nextDate.getDate() + averageCycleLength);
  
  return nextDate;
};

export const getCurrentPhase = (cycles: PeriodCycle[], currentDate: Date = new Date()): string => {
  const nextPeriod = predictNextPeriod(cycles);
  if (!nextPeriod) return 'unknown';
  
  const daysUntilNext = Math.ceil((nextPeriod.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
  const averageCycle = calculateAverageCycle(cycles);
  
  if (daysUntilNext <= 5 || daysUntilNext > averageCycle - 5) {
    return 'menstrual';
  } else if (daysUntilNext <= averageCycle / 2 - 2) {
    return 'follicular';
  } else if (daysUntilNext <= averageCycle / 2 + 2) {
    return 'ovulation';
  } else {
    return 'luteal';
  }
};

export const getPhaseEnergyLevel = (phase: string): 'low' | 'medium' | 'high' => {
  switch (phase) {
    case 'menstrual':
      return 'low';
    case 'follicular':
      return 'medium';
    case 'ovulation':
      return 'high';
    case 'luteal':
      return 'medium';
    default:
      return 'medium';
  }
};