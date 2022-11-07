import { Context, OpenError, ResolveError, AppIdentifier, AppMetadata, ImplementationMetadata } from '@finos/fdc3';
import { Application, Instance } from '../types/glue42Types';
import { GlueController } from './glue';
import { version } from '../../package.json';

export class ApplicationsController {
    constructor(private readonly glueController: GlueController) { }

    // backwards compatibility for deprecated fdc3.open(TargetApp)
    public async open(target: string | AppIdentifier, context?: Context): Promise<AppIdentifier> {
        await this.glueController.gluePromise;

        const name = typeof target === "object" 
            ? target.appId 
            : target;

        const app = this.glueController.getApplication(name);

        if (!app) {
            throw new Error(OpenError.AppNotFound);
        }

        try {
            const glueInst = await app.start(context);
            return this.parseGlueInstToAppIdentifier(glueInst);
        } catch (error) {
            throw new Error(`${OpenError.ErrorOnLaunch} - Error: ${error}`);
        }
    }

    public async findInstances(appIdentifier: AppIdentifier): Promise<AppIdentifier[]> {
        await this.glueController.gluePromise;

        const { appId } = appIdentifier;

        const app = this.glueController.getApplication(appId);

        if (!app) {
            throw new Error(ResolveError.NoAppsFound);
        }

        const glueInstances = this.glueController.getApplicationInstances(appId);

        return glueInstances.map(glueInst => this.parseGlueInstToAppIdentifier(glueInst));
    }

    public async getAppMetadata(appIdentifier: AppIdentifier): Promise<AppMetadata> {
        await this.glueController.gluePromise;

        const { appId, instanceId } = appIdentifier;

        const app = this.glueController.getApplication(appId);

        if (!app) {
            throw new Error(OpenError.AppNotFound);
        }

        if (instanceId) {
            const instance = this.glueController.getInstanceById(instanceId);

            return this.parseGlueAppToAppMetadata(app, instance);
        }

        return this.parseGlueAppToAppMetadata(app);
    }

    public async getInfo(): Promise<ImplementationMetadata> {
        await this.glueController.gluePromise;

        const appMetadata = await this.getCurrentAppMetadata();

        return {
            provider: "Glue42",
            providerVersion: this.glueController.getGlueVersion(),
            fdc3Version: version,
            optionalFeatures: {
                OriginatingAppMetadata: true,
                UserChannelMembershipAPIs: true
            },
            appMetadata
        };
    }

    private getCurrentAppMetadata(): Promise<AppMetadata> {
        const myInstance = this.glueController.interopInstance();

        return Promise.resolve({
            appId: myInstance.applicationName,
            instanceId: myInstance.instance
        });
    }

    private parseGlueInstToAppIdentifier(glueInst: Instance): AppIdentifier {
        return {
            appId: glueInst.application.name,
            instanceId: glueInst.id
        }
    }

    private async parseGlueAppToAppMetadata(app: Application, instance?: Instance): Promise<AppMetadata> {
        const appMetadata = this.getBaseGlueAppToAppMetadata(app);

        if (!instance) {
            return appMetadata;
        }

        return this.addInstanceMetadataToAppMetadata(appMetadata, instance);
    }

    private getBaseGlueAppToAppMetadata(app: Application): AppMetadata {
        return {
            appId: app.name,
            name: app.name,
            version: app.version,
            title: app.title,
            icons: app.icon ? [{ src: app.icon }] : [],
        }
    }

    private async addInstanceMetadataToAppMetadata(appMetadata: AppMetadata, instance: Instance): Promise<AppMetadata> {
        return { ...appMetadata, instanceId: instance.id, instanceMetadata: instance.agm };
    }
}