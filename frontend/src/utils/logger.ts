import { LOG_TEMPLATES, type LogEntity } from "../constants/logTemplates";

export function logAction<E extends LogEntity>(
  entity: E,
  action: keyof (typeof LOG_TEMPLATES)[E],
  detail: unknown
): void {
  const template = LOG_TEMPLATES[entity][action] as string;
  console.info(`[stage-light] ${template}`, detail);
}
