// Inspiration: https://khalilstemmler.com/articles/enterprise-typescript-nodejs/functional-error-handling/

class Result<T> {
  public isSuccess: boolean;
  public isFailure: boolean;
  public error: T | string | undefined;
  private value: T | undefined;

  public constructor(isSuccess: boolean, error?: T | string, value?: T) {
    this.isSuccess = isSuccess;
    this.isFailure = !isSuccess;
    this.error = error;
    this.value = value;

    Object.freeze(this);
  }

  public static ok<U>(value?: U): Result<U> {
    return new Result<U>(true, undefined, value);
  }

  public static fail<U>(error: any): Result<U> {
    return new Result<U>(false, error);
  }

  public getValue(): T {
    if (this.isSuccess) {
      return this.value as T;
    }
    return this.error as T;
  }
}

interface DomainError {
  message: string;
  error?: any;
}

export namespace AppError {
  export class UnexpectedError extends Result<DomainError> {
    public constructor(error: any) {
      super(false, {
        message: 'An unexpected error occurred.',
        error,
      });
    }

    public static create(error: any): UnexpectedError {
      return new UnexpectedError(error);
    }
  }

  export class ValidationError extends Result<DomainError> {
    public constructor(cause: string) {
      super(false, {
        message: `Validation error occurred. ${cause}`,
      });
    }

    public static create(error: any): UnexpectedError {
      return new ValidationError(error);
    }
  }
}

type CreateUserResponse = {
  uuid: number;
};

type IResponse =
  | Result<AppError.UnexpectedError>
  | Result<AppError.ValidationError>
  | Result<CreateUserResponse>;

function createUser(name: string, password: string): IResponse {
  if (password.length <= 6) {
    return Result.fail<AppError.ValidationError>('Password is too short.');
  } else if (password.length >= 32) {
    return Result.fail<AppError.ValidationError>('Password is too long.');
  }
  if (Math.random() > 0.5) {
    return Result.fail<AppError.UnexpectedError>('Connection error.');
  }

  return Result.ok({ uuid: 1000 });
}

createUser('test', 'test').getValue();
createUser('test', 'testtest').getValue();
