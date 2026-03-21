/**
 * 내부 라벨 → 표시 라벨 변환
 */
export function getDisplayLabel(internalLabel: string): string {
  const labelMap: { [key: string]: string } = {
    '본원-2': '-2',
    '본원-1': '-1',
    '본원': '본',
    '본원+1': '차',
    '본원+2': '+1',
    '본원+3': '+2',
  };
  
  return labelMap[internalLabel] || internalLabel;
}

/**
 * 표시 라벨 → 내부 라벨 변환
 */
export function getInternalLabel(displayLabel: string): string {
  const reverseMap: { [key: string]: string } = {
    '-2': '본원-2',
    '-1': '본원-1',
    '본': '본원',
    '차': '본원+1',
    '+1': '본원+2',
    '+2': '본원+3',
  };
  
  return reverseMap[displayLabel] || displayLabel;
}

/**
 * 라벨 순서 (내부 라벨 기준)
 */
export const LABEL_ORDER = ['본원-2', '본원-1', '본원', '본원+1', '본원+2', '본원+3'];

/**
 * 라벨 순서 (표시 라벨 기준)
 */
export const DISPLAY_LABEL_ORDER = ['-2', '-1', '본', '차', '+1', '+2'];