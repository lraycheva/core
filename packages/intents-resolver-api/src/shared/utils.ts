import { appManagerCompulsoryProps, glueCompulsoryProps } from './constants';

export const validateGlue = (glue: any): void => {
    const glueAPIs: string[] = Object.keys(glue);

    const missingAPIs = glueCompulsoryProps.filter(prop => !glueAPIs.includes(prop));

    if (missingAPIs.length) {
        throw new Error(`Glue is missing the following API${missingAPIs.length > 1 ? "s" : ""}: ${missingAPIs.join(", ")}`);
    }

    const appManagerProps = Object.keys(glue.appManager);

    const missingAppManagerProps = appManagerCompulsoryProps.filter(prop => !appManagerProps.includes(prop));

    if (missingAppManagerProps.length) {
        throw new Error(`Glue is not initialized with { "appManager: "full" }. Missing props: ${missingAppManagerProps.join(", ")}`);
    }
}