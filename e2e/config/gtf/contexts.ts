import { Gtf } from './types';

export class GtfContexts implements Gtf.Contexts {
  private counter = 0;

  public getContextName(): string {
    ++this.counter;

    return `contexts.integration.tests.${Date.now()}.${this.counter}`;
  }

  public generateComplexObject(complexity: number): { superNestedObject: any; numberArr: number[]; stringArr: string[]; objectArr: any[]; singleObject: any; dateArr: Date[] } {
    const increasingContext: any = {};

    increasingContext.superNestedObject = this.createSupperNestedObject(complexity);
    increasingContext.numberArr = this.createNumberArr(complexity);
    increasingContext.stringArr = this.createStringArr(complexity);
    increasingContext.objectArr = this.createObjectArr(complexity);
    increasingContext.singleObject = this.createObj(complexity);
    increasingContext.dateArr = this.createDateArr(complexity);

    return increasingContext;
  }

  private wrapObject = (obj: any, value: number) => {
    return {
      [`${value}`]: obj,
      [`${value}1`]: [`${value}`],
    };
  };

  private createNumberArr = (index: number): number[] => {
    const numberArr: number[] = [];
    Array.from({ length: index }).forEach((_, innerIndex) => {
      numberArr.push(innerIndex);
    });
    return numberArr;
  };

  private createDateArr = (index: number): Date[] => {
    const dateArr: Date[] = [];
    Array.from({ length: index }).forEach(() => {
      dateArr.push(new Date());
    });
    return dateArr;
  };

  private createStringArr = (index: number): string[] => {
    const stringArr: string[] = [];
    Array.from({ length: index }).forEach((_, innerIndex) => {
      stringArr.push(`${innerIndex}`);
    });

    return stringArr;
  };

  private createObjectArr = (index: number): any[] => {
    const objectArr: any[] = [];
    Array.from({ length: index }).forEach(() => {
      const baseObject = this.createObj(index);

      objectArr.push(baseObject);
    });

    return objectArr;
  };

  private createObj = (index: number): any => {
    const singleObject: any = {};
    Array.from({ length: index }).forEach((_, innerIndex) => {
      singleObject[`${innerIndex}`] = innerIndex;
    });

    Array.from({ length: index }).forEach((_, innerIndex) => {
      singleObject[`${innerIndex + index}`] = `${innerIndex}`;
    });

    return singleObject;
  };

  private createSupperNestedObject = (index: number): any => {
    let superNestedObject = {};
    Array.from({ length: index }).forEach((_, innerIndex) => {
      superNestedObject = this.wrapObject(superNestedObject, innerIndex);
    });

    return superNestedObject;
  };
}
