export function isOSCProfileReadOnly(dynamicsOSCStatusId: string | null | undefined): boolean {
  return dynamicsOSCStatusId === '206430000' || dynamicsOSCStatusId === '206430001';
}

export function needsResubmission(dynamicsOSCStatusId: string | null | undefined): boolean {
  if (!dynamicsOSCStatusId) {
    return false;
  }

  return ['206430000', '206430001', '206430002', '206430003', '206430004'].includes(
    dynamicsOSCStatusId,
  );
}
