import { Action } from './types.ts';

export const ACTIONS: Action[] = [
  {
    id: 'flowing_water',
    phase: 'during',
    priority: 5,
    titleKey: 'act_flowing_water_title',
    bodyKey: 'act_flowing_water_body',
    icon: 'droplets',
    timeToComplete_min: 5
  },
  {
    id: 'electrocution',
    phase: 'during',
    priority: 5,
    titleKey: 'act_electrocution_title',
    bodyKey: 'act_electrocution_body',
    icon: 'zap',
    timeToComplete_min: 10
  },
  {
    id: 'medical_equipment',
    phase: 'before',
    priority: 4,
    titleKey: 'act_medical_equipment_title',
    bodyKey: 'act_medical_equipment_body',
    icon: 'battery-charging',
    timeToComplete_min: 60
  },
  {
    id: 'snakebite',
    phase: 'during',
    priority: 5,
    titleKey: 'act_snakebite_title',
    bodyKey: 'act_snakebite_body',
    icon: 'activity',
    timeToComplete_min: 10
  },
  {
    id: 'waterborne_disease',
    phase: 'during',
    priority: 4,
    titleKey: 'act_waterborne_title',
    bodyKey: 'act_waterborne_body',
    icon: 'shield-alert',
    timeToComplete_min: 30
  },
  {
    id: 'landslide',
    phase: 'during',
    priority: 5,
    titleKey: 'act_landslide_title',
    bodyKey: 'act_landslide_body',
    icon: 'mountain',
    timeToComplete_min: 5
  },
  {
    id: 'gas_cylinder',
    phase: 'before',
    priority: 3,
    titleKey: 'act_gas_title',
    bodyKey: 'act_gas_body',
    icon: 'flame',
    timeToComplete_min: 10
  },
  {
    id: 'documents',
    phase: 'before',
    priority: 3,
    titleKey: 'act_docs_title',
    bodyKey: 'act_docs_body',
    icon: 'file-text',
    timeToComplete_min: 30
  },
  {
    id: 'livestock',
    phase: 'during',
    priority: 4,
    titleKey: 'act_livestock_title',
    bodyKey: 'act_livestock_body',
    icon: 'shield',
    timeToComplete_min: 15
  }
];

export const ACTIONS_MAP = new Map<string, Action>(ACTIONS.map(a => [a.id, a]));
