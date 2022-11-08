import { GlueController } from '../controllers/glue';
import { MainController } from '../controllers/main';
import { IntentsResolver } from '../types/types';

export class IoC {
    private _intentsResolver!: IntentsResolver;
    private _glueController!: GlueController;

    public get intentsResolver(): IntentsResolver {
        if (!this._intentsResolver) {
            this._intentsResolver = new MainController(this.glueController).toApi();
        }

        return this._intentsResolver;
    }

    public get glueController(): GlueController {
        if (!this._glueController) {
            this._glueController = new GlueController();
        }

        return this._glueController;
    }
}