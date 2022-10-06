import { getElementBounds } from "../utils";

export class TabObserver {
    private containerElement: Element;

    public init(containerElementId: string): void {
        this.containerElement = $(`${containerElementId}`)[0];

        this.setupEvents();
    }

    public refreshTabsMaxWidth(tabsElement: JQuery<Element>): void {
        const tabChildren = tabsElement.children();
        const visibleTabs = this.visibleTabs($(tabsElement));
        const width = visibleTabs.reduce((acc, vt) => {
            const tabSize = this.getTabWidth(vt);

            return acc + tabSize;
        }, 0);
        tabsElement.css("max-width", `${width}px`);

        Array.from(tabChildren).forEach((tab) => {
            const title = $(tab).children(".lm_title");
            const tabWidth = getElementBounds(tab).width;
            title.css("max-width", `${tabWidth * 0.75}px`);
            this.refreshTabClasses(tab);
        });
    }

    private setupEvents(): () => void {
        const observer = new MutationObserver((records) => {
            Array.from(records).forEach((r) => {
                if (r.type === "childList" && (r.target as Element).classList.contains("lm_tabs")) {
                    const tabs = $(r.target as Element);
                    this.handleTabCountChanged(tabs, Array.from(r.removedNodes), Array.from(r.addedNodes));
                } else if (r.type === "attributes"
                    && (r.target as Element).classList.contains("lm_stack")
                    && r.attributeName === "style") {
                    const stackElement = $(r.target);
                    this.handleTabHeaderResized(stackElement);
                }
            });
        });
        observer.observe(this.containerElement, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ["style"],
            attributeOldValue: false,
            characterData: false,
            characterDataOldValue: false
        });

        return (): void => {
            observer.disconnect();
        };
    }

    private handleTabCountChanged(tabsElement: JQuery<Element>, removedNodes: Node[], _: Node[]): void {
        const tabChildren = tabsElement.children();
        const visibleTabs = this.visibleTabs($(tabsElement));
        const width = visibleTabs.reduce((acc, vt) => {
            const tabSize = this.getTabWidth(vt);

            return acc + tabSize;
        }, 0);
        tabsElement.css("max-width", `${width}px`);

        Array.from(tabChildren).forEach((tab) => {
            const title = $(tab).children(".lm_title");
            const tabWidth = getElementBounds(tab).width;
            title.css("max-width", `${tabWidth * 0.75}px`);
            if (removedNodes.length) {
                this.refreshTabClasses(tab);
            }
        });
    }

    private handleTabHeaderResized(stackElement: JQuery<Node>): void {
        const headerElement = stackElement.children(".lm_header");
        const tabElements = headerElement.children(".lm_tabs") as JQuery<Element>;
        const visibleTabs = this.visibleTabs($(tabElements));

        visibleTabs.forEach((tab, i) => {
            const title = $(tab).children(".lm_title");
            const tabLength = getElementBounds(visibleTabs[i]).width;
            title.css("max-width", `${tabLength * 0.75}px`);

            this.refreshTabClasses(tab);
        });
    }

    private refreshTabClasses(tab: Node): void {
        const tabOuterWidth = $(tab).outerWidth();
        const classes = (tab as Element).classList;

        const removeAll = () => {
            classes.remove("lm_tab_mini");
            classes.remove("lm_tab_small");
            classes.remove("lm_tab_mid");
        };

        if (this.isTabPinned(tab as HTMLElement)) {
            removeAll();
        } else if (tabOuterWidth >= 35 && tabOuterWidth < 55) {
            classes.remove("lm_tab_mini");
            classes.remove("lm_tab_small");

            classes.add("lm_tab_mid");
        } else if (tabOuterWidth >= 25 && tabOuterWidth < 35) {
            classes.remove("lm_tab_mini");
            classes.remove("lm_tab_mid");

            classes.add("lm_tab_small");
        } else if (tabOuterWidth >= 55) {
            removeAll();
        } else if (tabOuterWidth < 25) {
            classes.remove("lm_tab_mid");
            classes.remove("lm_tab_small");
            
            classes.add("lm_tab_mini");
        }
    }

    private visibleTabs(tabsContainer: JQuery<Element>): HTMLElement[] {
        return Array.from(tabsContainer.children()).filter((t) => $(t).is(":visible")).map((t) => t as HTMLElement);
    }

    private isTabPinned(tabElement: HTMLElement): boolean {
        return tabElement.classList.contains("lm_pinned");
    }

    private getTabWidth(tabElement: HTMLElement): number {
        if (this.isTabPinned(tabElement)) {
            return getElementBounds(tabElement).width;
        }

        return 200;
    }
}