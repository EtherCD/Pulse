export class ValidateError extends Error {
  packageName: string;
  fieldName: string;

  constructor(msg: string, packageName: string, fieldName: string) {
    super(msg + ` (package ${packageName}, field ${fieldName})`);
    this.packageName = packageName;
    this.fieldName = fieldName;
  }
}
