/// <reference path="../../typings/index.d.ts" />

import {Observable} from "rxjs/Observable";

import {MouseService} from "../../src/Viewer";

import {EventHelper} from "../helper/EventHelper.spec";

describe("MouseService.ctor", () => {
    it("should be definded", () => {
        const container: HTMLElement = document.createElement("div");
        const canvasContainer: HTMLElement = document.createElement("div");
        const domContainer: HTMLElement = document.createElement("div");
        const doc: HTMLElement = document.createElement("div");

        const mouseService: MouseService = new MouseService(container, canvasContainer, domContainer, doc);

        expect(mouseService).toBeDefined();
    });
});

describe("MouseService.mouseDragStart$", () => {
    it("should emit mouse drag start", () => {
        const container: HTMLElement = document.createElement("div");
        const canvasContainer: HTMLElement = document.createElement("div");
        const domContainer: HTMLElement = document.createElement("div");
        const doc: HTMLElement = document.createElement("div");

        const mouseService: MouseService = new MouseService(container, canvasContainer, domContainer, doc);

        let mouseDragStartEmitCount: number = 0;
        mouseService.mouseDragStart$
            .subscribe(
                (event: MouseEvent): void => {
                    mouseDragStartEmitCount++;
                    expect(event.button === 0);
                });

        const mouseDownEvent: MouseEvent = EventHelper.createMouseEvent("mousedown", { button: 0 }, canvasContainer);
        const mouseMoveEvent: MouseEvent = EventHelper.createMouseEvent("mousemove", {}, document);

        doc.dispatchEvent(mouseMoveEvent);
        expect(mouseDragStartEmitCount).toBe(0);

        canvasContainer.dispatchEvent(mouseDownEvent);

        doc.dispatchEvent(mouseMoveEvent);
        expect(mouseDragStartEmitCount).toBe(1);
    });

    it("should not emit mouse drag start when not left button", () => {
        const container: HTMLElement = document.createElement("div");
        const canvasContainer: HTMLElement = document.createElement("div");
        const domContainer: HTMLElement = document.createElement("div");
        const doc: HTMLElement = document.createElement("div");

        const mouseService: MouseService = new MouseService(container, canvasContainer, domContainer, doc);

        let mouseDragStartEmitCount: number = 0;
        mouseService.mouseDragStart$
            .subscribe(
                (event: MouseEvent): void => {
                    mouseDragStartEmitCount++;
                });

        const mouseDownEvent: MouseEvent = EventHelper.createMouseEvent("mousedown", { button: 1 }, canvasContainer);
        const mouseMoveEvent: MouseEvent = EventHelper.createMouseEvent("mousemove", {}, document);

        canvasContainer.dispatchEvent(mouseDownEvent);
        doc.dispatchEvent(mouseMoveEvent);

        expect(mouseDragStartEmitCount).toBe(0);
    });
});

describe("MouseService.mouseDrag$", () => {
    it("should emit mouse drag", () => {
        const container: HTMLElement = document.createElement("div");
        const canvasContainer: HTMLElement = document.createElement("div");
        const domContainer: HTMLElement = document.createElement("div");
        const doc: HTMLElement = document.createElement("div");

        const mouseService: MouseService = new MouseService(container, canvasContainer, domContainer, doc);

        let mouseDragEmitCount: number = 0;
        mouseService.mouseDrag$
            .subscribe(
                (event: MouseEvent): void => {
                    mouseDragEmitCount++;
                });

        const mouseDownEvent: MouseEvent = EventHelper.createMouseEvent("mousedown", { button: 0 }, canvasContainer);
        const mouseMoveEvent: MouseEvent = EventHelper.createMouseEvent("mousemove", {}, document);

        doc.dispatchEvent(mouseMoveEvent);
        expect(mouseDragEmitCount).toBe(0);

        canvasContainer.dispatchEvent(mouseDownEvent);

        doc.dispatchEvent(mouseMoveEvent);
        expect(mouseDragEmitCount).toBe(0);

        doc.dispatchEvent(mouseMoveEvent);
        expect(mouseDragEmitCount).toBe(1);
    });

    it("should emit mouse drag after switch mappping from mouse drag start", () => {
        const container: HTMLElement = document.createElement("div");
        const canvasContainer: HTMLElement = document.createElement("div");
        const domContainer: HTMLElement = document.createElement("div");
        const doc: HTMLElement = document.createElement("div");

        const mouseService: MouseService = new MouseService(container, canvasContainer, domContainer, doc);

        let emitCount: number = 0;
        mouseService.mouseDragStart$
            .switchMap(
                (e: MouseEvent): Observable<MouseEvent> => {
                    return mouseService.mouseDrag$;
                })
            .subscribe(
                (event: MouseEvent): void => {
                    emitCount++;
                });

        const mouseDownEvent: MouseEvent = EventHelper.createMouseEvent("mousedown", { button: 0 }, canvasContainer);
        const mouseMoveEvent: MouseEvent = EventHelper.createMouseEvent("mousemove", {}, doc);

        canvasContainer.dispatchEvent(mouseDownEvent);
        expect(emitCount).toBe(0);

        doc.dispatchEvent(mouseMoveEvent);
        expect(emitCount).toBe(0);

        doc.dispatchEvent(mouseMoveEvent);
        expect(emitCount).toBe(1);

        doc.dispatchEvent(mouseMoveEvent);
        expect(emitCount).toBe(2);
    });

    it("should emit filtered mouse drag after switch mappping from filtered mouse drag start", () => {
        const container: HTMLElement = document.createElement("div");
        const canvasContainer: HTMLElement = document.createElement("div");
        const domContainer: HTMLElement = document.createElement("div");
        const doc: HTMLElement = document.createElement("div");

        const mouseService: MouseService = new MouseService(container, canvasContainer, domContainer, doc);

        mouseService.claimMouse("test", 1);

        let emitCount: number = 0;
        mouseService
            .filtered$("test", mouseService.mouseDragStart$)
            .switchMap(
                (e: MouseEvent): Observable<MouseEvent> => {
                    return mouseService.filtered$("test", mouseService.mouseDrag$);
                })
            .subscribe(
                (event: MouseEvent): void => {
                    emitCount++;
                });

        const mouseDownEvent: MouseEvent = EventHelper.createMouseEvent("mousedown", { button: 0 }, canvasContainer);
        const mouseMoveEvent: MouseEvent = EventHelper.createMouseEvent("mousemove", {}, document);

        canvasContainer.dispatchEvent(mouseDownEvent);
        expect(emitCount).toBe(0);

        doc.dispatchEvent(mouseMoveEvent);
        expect(emitCount).toBe(0);

        doc.dispatchEvent(mouseMoveEvent);
        expect(emitCount).toBe(1);

        doc.dispatchEvent(mouseMoveEvent);
        expect(emitCount).toBe(2);
    });
});

describe("MouseService.mouseDragEnd$", () => {
    it("should emit mouse drag end on mouse up", (done: Function) => {
        const container: HTMLElement = document.createElement("div");
        const canvasContainer: HTMLElement = document.createElement("div");
        const domContainer: HTMLElement = document.createElement("div");
        const doc: HTMLElement = document.createElement("div");

        const mouseService: MouseService = new MouseService(container, canvasContainer, domContainer, doc);

        mouseService.mouseDragEnd$
            .subscribe(
                (event: MouseEvent): void => {
                    done();
                });

        const mouseDownEvent: MouseEvent = EventHelper.createMouseEvent("mousedown", { button: 0 }, canvasContainer);
        const mouseMoveEvent: MouseEvent = EventHelper.createMouseEvent("mousemove", {}, document);
        const mouseUpEvent: MouseEvent = EventHelper.createMouseEvent("mouseup", {}, document);

        canvasContainer.dispatchEvent(mouseDownEvent);
        doc.dispatchEvent(mouseMoveEvent);
        doc.dispatchEvent(mouseUpEvent);
    });

    it("should emit mouse drag end on window blur", (done: Function) => {
        const container: HTMLElement = document.createElement("div");
        const canvasContainer: HTMLElement = document.createElement("div");
        const domContainer: HTMLElement = document.createElement("div");
        const doc: HTMLElement = document.createElement("div");

        const mouseService: MouseService = new MouseService(container, canvasContainer, domContainer, doc);

        mouseService.mouseDragEnd$
            .subscribe(
                (event: MouseEvent): void => {
                    done();
                });

        const mouseDownEvent: MouseEvent = EventHelper.createMouseEvent("mousedown", { button: 0 }, canvasContainer);
        const mouseMoveEvent: MouseEvent = EventHelper.createMouseEvent("mousemove", {}, document);
        const blurEvent: UIEvent = EventHelper.createUIEvent("blur");

        canvasContainer.dispatchEvent(mouseDownEvent);
        doc.dispatchEvent(mouseMoveEvent);
        window.dispatchEvent(blurEvent);
    });
});
