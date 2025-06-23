export function cleanToDigitsOnly(input: string[]): string[] {
  return input.map((str) => str.replace(/\D/g, ""));
}
