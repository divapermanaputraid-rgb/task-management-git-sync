export function formatTaskCode(sequenceNumber: number) {
  if (!Number.isInteger(sequenceNumber) || sequenceNumber < 1) {
    throw new Error("Task sequence must be a positive integer.");
  }

  return `TASK-${sequenceNumber}`;
}
