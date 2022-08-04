lm.utils.TabDragListener = function (eElement, nButtonCode) {
    lm.utils.EventEmitter.call(this);

    this._eElement = $(eElement);
    this._oDocument = $(document);
    this._eBody = $(document.body);
    this._nButtonCode = nButtonCode || 0;

    /**
     * The delay after which to start the drag in milliseconds
     */
    this._nDelay = 400;

    /**
     * The distance the mouse needs to be moved to qualify as a drag
     */
    this._nDistance = 10;//TODO - works better with delay only

    this._nX = 0;
    this._nY = 0;

    this._nOriginalX = 0;
    this._nOriginalY = 0;

    this._bDragging = false;

    this._fMove = lm.utils.fnBind(this.onMouseMove, this);
    this._fUp = lm.utils.fnBind(this.onMouseUp, this);
    this._fDown = lm.utils.fnBind(this.onMouseDown, this);


    this._eElement.on('mousedown touchstart', this._fDown);
};

lm.utils.TabDragListener.timeout = null;
lm.utils.TabDragListener.reorderTimeout = null;

lm.utils.copy(lm.utils.TabDragListener.prototype, {
    destroy: function () {
        this._eElement.unbind('mousedown touchstart', this._fDown);
        this._oDocument.unbind('mouseup touchend', this._fUp);
        this._eElement = null;
        this._oDocument = null;
        this._eBody = null;
    },

    onMouseDown: function (oEvent) {
        oEvent.preventDefault();

        if (oEvent.button == 0 || oEvent.type === "touchstart") {
            var coordinates = this._getCoordinates(oEvent);

            this._nOriginalX = coordinates.x;
            this._nOriginalY = coordinates.y;

            this._oDocument.on('mousemove touchmove', this._fMove);
            this._oDocument.one('mouseup touchend', this._fUp);

            this.reorderTimeout = setTimeout(lm.utils.fnBind(function () { this._startReorder(oEvent) }, this), this._nDelay);
        }
    },

    onMouseMove: function (oEvent) {
        const coordinates = this._getCoordinates(oEvent);

        if (this._timeout != null) {
            oEvent.preventDefault();

            this._nX = coordinates.x - this._nOriginalX;
            this._nY = coordinates.y - this._nOriginalY;

            if (this._bDragging === false) {
                if (
                    Math.abs(this._nX) > this._nDistance ||
                    Math.abs(this._nY) > this._nDistance
                ) {
                    clearTimeout(this._timeout);
                    this._timeout = null;
                    this._startDrag(oEvent);
                }
            }

            if (this._bDragging) {
                this.emit('drag', this._nX, this._nY, oEvent);
            }
        } else if (this._inReorder) {
            const parent = this._eElement.parent();
            const parentBounds = parent[0].getBoundingClientRect();
            const tolerance = 15;

            const isXOverTolerance = parentBounds.left - coordinates.x > tolerance || coordinates.x - parentBounds.right > tolerance;
            const isYOverTolerance = parentBounds.top - coordinates.y > tolerance || coordinates.y - parentBounds.bottom > tolerance;

            if (isXOverTolerance || isYOverTolerance) {
                this._timeout = setTimeout(lm.utils.fnBind(function () { this._startDrag(oEvent) }, this), this._nDelay);
            } else {
                this._onReorder(oEvent);
            }
        }
    },

    onMouseUp: function (oEvent) {
        // if (this._timeout != null) {
        this._stopReorder(oEvent);
        clearTimeout(this._timeout);
        this._timeout = null;
        this._eBody.removeClass('lm_dragging');
        this._eElement.removeClass('lm_dragging');
        this._oDocument.find('iframe').css('pointer-events', '');
        this._oDocument.unbind('mousemove touchmove', this._fMove);
        this._oDocument.unbind('mouseup touchend', this._fUp);

        if (this._bDragging === true) {
            this._bDragging = false;
            this.emit('dragStop', oEvent, this._nOriginalX + this._nX);
        }
        // }
    },

    _startDrag: function (e) {
        this._stopReorder(e);
        this._bDragging = true;
        this._eBody.addClass('lm_dragging');
        this._eElement.addClass('lm_dragging');
        this._oDocument.find('iframe').css('pointer-events', 'none');
        this.emit('dragStart', this._nOriginalX, this._nOriginalY, e);
    },

    _startReorder: function (e) {
        this._inReorder = true;
        this._oDocument.find('iframe').css('pointer-events', 'none');
        this.emit('reorderStart', this._nOriginalX, this._nOriginalY, e);
    },
    _onReorder: function (e) {
        if (this._inReorder) {
            const coordinates = this._getCoordinates(e);
            this.emit("reorder", coordinates.x, coordinates.y);
        }
    },
    _stopReorder: function (e) {
        clearTimeout(this.reorderTimeout);

        if (this._inReorder !== null) {
            const coordinates = this._getCoordinates(e);

            this.emit("reorderStop", coordinates.x, coordinates.y);
        }
        this._inReorder = false;
    },
    _getCoordinates: function (event) {
        event = event.originalEvent && event.originalEvent.touches ? event.originalEvent.touches[0] : event;
        return {
            x: event.pageX,
            y: event.pageY
        };
    }
});