/*
 * 
 *                  xxxxxxx      xxxxxxx
 *                   x:::::x    x:::::x 
 *                    x:::::x  x:::::x  
 *                     x:::::xx:::::x   
 *                      x::::::::::x    
 *                       x::::::::x     
 *                       x::::::::x     
 *                      x::::::::::x    
 *                     x:::::xx:::::x   
 *                    x:::::x  x:::::x  
 *                   x:::::x    x:::::x 
 *              THE xxxxxxx      xxxxxxx TOOLKIT
 *                    
 *                  http://www.goXTK.com
 *                   
 * Copyright (c) 2012 The X Toolkit Developers <dev@goXTK.com>
 *                   
 *    The X Toolkit (XTK) is licensed under the MIT License:
 *      http://www.opensource.org/licenses/mit-license.php
 * 
 *      "Free software" is a matter of liberty, not price.
 *      "Free" as in "free speech", not as in "free beer".
 *                                         - Richard M. Stallman
 * 
 * 
 */

// provides
goog.provide('X.volume');

// requires
goog.require('X.object');
goog.require('X.slice');



/**
 * Create a displayable volume which consists of X.slices in X,Y and Z direction
 * and can also be volume rendered.
 * 
 * @constructor
 * @param {X.volume=} volume Another X.volume to use as a template.
 * @extends X.object
 */
X.volume = function(volume) {

  //
  // call the standard constructor of X.base
  goog.base(this);
  
  //
  // class attributes
  
  /**
   * @inheritDoc
   * @const
   */
  this['className'] = 'volume';
  
  /**
   * The center of this volume.
   * 
   * @type {!Array}
   * @protected
   */
  this._center = [0, 0, 0];
  
  /**
   * The dimensions of this volume.
   * 
   * @type {!Array}
   * @protected
   */
  this._dimensions = [10, 10, 10];
  
  /**
   * The spacing of this volume.
   * 
   * @type {!Array}
   * @protected
   */
  this._spacing = [1, 1, 1];
  
  /**
   * The index of the currently shown slice in X-direction.
   * 
   * @type {!number}
   * @public
   */
  this['_indexX'] = 0;
  
  /**
   * The index of the formerly shown slice in X-direction.
   * 
   * @type {!number}
   * @protected
   */
  this._indexXold = 0;
  
  /**
   * The index of the currently shown slice in Y-direction.
   * 
   * @type {!number}
   * @public
   */
  this['_indexY'] = 0;
  
  /**
   * The index of the formerly shown slice in Y-direction.
   * 
   * @type {!number}
   * @protected
   */
  this._indexYold = 0;
  
  /**
   * The index of the currently shown slice in Z-direction.
   * 
   * @type {!number}
   * @public
   */
  this['_indexZ'] = 0;
  
  /**
   * The index of the formerly shown slice in Z-direction.
   * 
   * @type {!number}
   * @protected
   */
  this._indexZold = 0;
  
  /**
   * The X.object holding the slices in X-direction.
   * 
   * @type {!X.object}
   * @protected
   */
  this._slicesX = new X.object();
  
  /**
   * The X.object holding the slices in Y-direction.
   * 
   * @type {!X.object}
   * @protected
   */
  this._slicesY = new X.object();
  
  /**
   * The X.object holding the slices in Z-direction.
   * 
   * @type {!X.object}
   * @protected
   */
  this._slicesZ = new X.object();
  
  /**
   * The upper threshold for this volume.
   * 
   * @type {number}
   * @public
   */
  this['_lowerThreshold'] = 0;
  
  /**
   * The upper threshold for this volume.
   * 
   * @type {number}
   * @public
   */
  this['_upperThreshold'] = 1000;
  
  /**
   * The scalar range of this volume.
   * 
   * @type {!Array}
   * @protected
   */
  this._scalarRange = [0, 1000];
  
  /**
   * The toggle for volume rendering or cross-sectional slicing.
   * 
   * @type {boolean}
   * @public
   */
  this['_volumeRendering'] = false;
  this._volumeRenderingOld = false;
  
  /**
   * The direction for the volume rendering. This is used for caching.
   * 
   * @type {!number}
   * @private
   */
  this._volumeRenderingDirection = 0;
  
  /**
   * The label map of this volume.
   * 
   * @type {?X.volume}
   * @private
   */
  this._labelMap = null;
  
  /**
   * Flag to show borders or not.
   * 
   * @type {boolean}
   * @protected
   */
  this._borders = true;
  
  if (goog.isDefAndNotNull(volume)) {
    
    // copy the properties of the given volume over
    this.copy_(volume);
    
  }
  
};
// inherit from X.object
goog.inherits(X.volume, X.object);



/**
 * Copies the properties from a given volume to this volume.
 * 
 * @param {!X.volume} volume The given volume.
 * @protected
 */
X.volume.prototype.copy_ = function(volume) {

  this._center = volume._center.slice();
  this._dimensions = volume._dimensions.slice();
  this._spacing = volume._spacing.slice();
  this['_indexX'] = volume['_indexX'];
  this._indexXold = volume._indexXold;
  this['_indexY'] = volume['_indexY'];
  this._indexYold = volume._indexYold;
  this['_indexZ'] = volume['_indexZ'];
  this._indexZold = volume._indexZold;
  this._slicesX = new X.object(volume._slicesX);
  this._slicesY = new X.object(volume._slicesY);
  this._slicesZ = new X.object(volume._slicesZ);
  this['_lowerThreshold'] = volume['_lowerThreshold'];
  this['_upperThreshold'] = volume['_upperThreshold'];
  this._scalarRange = volume._scalarRange.slice();
  this['_volumeRendering'] = volume['_volumeRendering'];
  this._volumeRenderingOld = volume._volumeRenderingOld;
  this._volumeRenderingDirection = volume._volumeRenderingDirection;
  this._labelMap = volume._labelMap;
  this._borders = volume._borders;
  
  // call the superclass' modified method
  X.volume.superClass_.copy_.call(this, volume);
  
};


/**
 * Create the volume.
 * 
 * @private
 */
X.volume.prototype.create_ = function() {

  // remove all old children
  this.children().length = 0;
  
  // add the new children
  this.children().push(this._slicesX);
  this.children().push(this._slicesY);
  this.children().push(this._slicesZ);
  
  //
  // create the slices
  var xyz = 0; // 0 for x, 1 for y, 2 for z
  for (xyz = 0; xyz < 3; xyz++) {
    
    var halfDimension = (this._dimensions[xyz] - 1) / 2;
    
    var _indexCenter = halfDimension;
    
    var i = 0;
    for (i = 0; i < this._dimensions[xyz]; i++) {
      
      var _position = (-halfDimension * this._spacing[xyz]) +
          (i * this._spacing[xyz]);
      
      var _center = new Array([this._center[0] + _position, this._center[1],
                               this._center[2]], [this._center[0],
                                                  this._center[1] + _position,
                                                  this._center[2]],
          [this._center[0], this._center[1], this._center[2] + _position]);
      
      var _front = new Array([1, 0, 0], [0, 1, 0], [0, 0, 1]);
      var _up = new Array([0, 1, 0], [0, 0, -1], [0, 1, 0]);
      
      // the container and indices
      var slices = this.children()[xyz].children();
      
      // dimensions
      var width = 0;
      var height = 0;
      var borderColor = [1, 1, 1];
      var borders = this._borders;
      if (xyz == 0) {
        // for x slices
        width = this._dimensions[2] * this._spacing[2] - this._spacing[2];
        height = this._dimensions[1] * this._spacing[1] - this._spacing[1];
        borderColor = [1, 1, 0];
      } else if (xyz == 1) {
        // for y slices
        width = this._dimensions[0] * this._spacing[0] - this._spacing[0];
        height = this._dimensions[2] * this._spacing[2] - this._spacing[2];
        borderColor = [1, 0, 0];
      } else if (xyz == 2) {
        // for z slices
        width = this._dimensions[0] * this._spacing[0] - this._spacing[0];
        height = this._dimensions[1] * this._spacing[1] - this._spacing[1];
        borderColor = [0, 1, 0];
      }
      
      // for labelmaps, don't create the borders since this would create them 2x
      if (goog.isDefAndNotNull(this._volume)) {
        borders = false;
      }
      
      // .. new slice
      var _slice = new X.slice();
      _slice.setup(_center[xyz], _front[xyz], _up[xyz], width, height, borders,
          borderColor);
      _slice._volume = this;
      
      // only show the middle slice, hide everything else
      _slice._hideChildren = false;
      _slice.setVisible(i == Math.floor(_indexCenter));
      _slice._hideChildren = true;
      
      // attach to all _slices with the correct slice index
      slices.push(_slice);
      
    }
    
    // by default, all the 'middle' slices are shown
    if (xyz == 0) {
      this['_indexX'] = _indexCenter;
      this._indexXold = _indexCenter;
    } else if (xyz == 1) {
      this['_indexY'] = _indexCenter;
      this._indexYold = _indexCenter;
    } else if (xyz == 2) {
      this['_indexZ'] = _indexCenter;
      this._indexZold = _indexCenter;
    }
  }
  
  this.dirty = true;
  
};

/**
 * Re-show the slices or re-activate the volume rendering for this volume.
 * 
 * @inheritDoc
 */
X.volume.prototype.modified = function() {

  // only do this if we already have children aka. the create_() method was
  // called
  if (this.children().length > 0) {
    if (this['_volumeRendering'] != this._volumeRenderingOld) {
      
      if (this['_volumeRendering']) {
        
        // first, hide possible slicing slices but only if volume rendering was
        // just switched on
        var _sliceX = this.children()[0].children()[parseInt(this['_indexX'],
            10)];
        _sliceX._hideChildren = false;
        _sliceX.setVisible(false);
        _sliceX._hideChildren = true;
        var _sliceY = this.children()[1].children()[parseInt(this['_indexY'],
            10)];
        _sliceY._hideChildren = false;
        _sliceY.setVisible(false);
        _sliceY._hideChildren = true;
        var _sliceZ = this.children()[2].children()[parseInt(this['_indexZ'],
            10)];
        _sliceZ._hideChildren = false;
        _sliceZ.setVisible(false);
        _sliceZ._hideChildren = true;
        
      } else {
        
        // hide the volume rendering slices
        var _child = this.children()[this._volumeRenderingDirection];
        _child.setVisible(false);
        
      }
      
      // switch from slicing to volume rendering or vice versa
      this.dirty = true;
      this._volumeRenderingOld = this['_volumeRendering'];
      
    }
    
    if (this['_volumeRendering']) {
      
      // prepare volume rendering
      this.volumeRendering_(this._volumeRenderingDirection);
      
    } else {
      
      // prepare slicing
      this.slicing_();
      
    }
  }
  
  // call the superclass' modified method
  X.volume.superClass_.modified.call(this);
  
};

/**
 * Show the current slices which are set by this._indexX, this._indexY and
 * this._indexZ and hide all others.
 */
X.volume.prototype.slicing_ = function() {

  // display the current slices in X,Y and Z direction
  var xyz = 0; // 0 for x, 1 for y, 2 for z
  for (xyz = 0; xyz < 3; xyz++) {
    
    var _child = this.children()[xyz];
    var currentIndex = 0;
    var oldIndex = 0;
    
    // buffer the old indices
    if (xyz == 0) {
      currentIndex = this['_indexX'];
      oldIndex = this._indexXold;
      this._indexXold = this['_indexX'];
    } else if (xyz == 1) {
      currentIndex = this['_indexY'];
      oldIndex = this._indexYold;
      this._indexYold = this['_indexY'];
    } else if (xyz == 2) {
      currentIndex = this['_indexZ'];
      oldIndex = this._indexZold;
      this._indexZold = this['_indexZ'];
    }
    
    // hide the old slice
    var _oldSlice = _child.children()[parseInt(oldIndex, 10)];
    _oldSlice._hideChildren = false;
    _oldSlice.setVisible(false);
    _oldSlice._hideChildren = true;
    // show the current slice and also show the borders if they exist by
    // deactivating the hideChildren flag
    var _currentSlice = _child.children()[parseInt(currentIndex, 10)];
    _currentSlice._hideChildren = false;
    _currentSlice.setVisible(true);
    _currentSlice._hideChildren = true;
    _currentSlice.setOpacity(1.0);
    
  }
  
};


/**
 * Get the dimensions of this volume.
 * 
 * @return {!Array} The dimensions of this volume.
 */
X.volume.prototype.dimensions = function() {

  return this._dimensions;
  
};


/**
 * Get the scalar range of this volume.
 * 
 * @return {!Array} The scalar range of this volume.
 */
X.volume.prototype.scalarRange = function() {

  return this._scalarRange;
  
};


/**
 * Threshold this volume. All pixel values smaller than lower or larger than
 * upper are ignored during rendering.
 * 
 * @param {!number} lower The lower threshold value.
 * @param {!number} upper The upper threshold value.
 * @throws {Error} If the specified range is invalid.
 */
X.volume.prototype.threshold = function(lower, upper) {

  if (!goog.isDefAndNotNull(lower) || !goog.isNumber(lower) ||
      !goog.isDefAndNotNull(upper) || !goog.isNumber(upper) ||
      (lower > upper) || (lower < this._scalarRange[0]) ||
      (upper > this._scalarRange[1])) {
    
    throw new Error('Invalid threshold range.');
    
  }
  
  this['_lowerThreshold'] = lower;
  this['_upperThreshold'] = upper;
  
};


/**
 * Toggle volume rendering or cross-sectional slicing of this X.volume.
 * 
 * @param {boolean} volumeRendering If TRUE, display volume rendering, if FALSE
 *          display cross-sectional slices.
 */
X.volume.prototype.setVolumeRendering = function(volumeRendering) {

  this['_volumeRendering'] = volumeRendering;
  
};


/**
 * @inheritDoc
 */
X.volume.prototype.setVisible = function(visible) {

  // we do not want to propagate to the children here
  
  this['_visible'] = visible;
  
};


/**
 * Set the center of this X.volume. This has to be called (for now) before a
 * volume data gets loaded aka. before the first X.renderer.render() call.
 * 
 * @param {!Array} center The new center.
 * @throws {Error} If the center is invalid.
 */
X.volume.prototype.setCenter = function(center) {

  if (!goog.isDefAndNotNull(center) || !(center instanceof Array) ||
      !(center.length == 3)) {
    
    throw new Error('Invalid center.');
    
  }
  
  this._center = center;
  
};


/**
 * Perform volume rendering of this volume along a specific direction. The
 * direction is important since we show tiled 2d textures along the direction
 * for a clean rendering experience.
 * 
 * @param {number} direction The direction of the volume rendering
 *          (0==x,1==y,2==z).
 */
X.volume.prototype.volumeRendering_ = function(direction) {

  if ((!this['_volumeRendering']) ||
      (!this.dirty && direction == this._volumeRenderingDirection)) {
    
    // we do not have to do anything
    return;
    
  }
  
  // hide old volume rendering slices
  var _child = this.children()[this._volumeRenderingDirection];
  _child.setVisible(false);
  
  // show new volume rendering slices
  _child = this.children()[direction];
  _child.setVisible(true);
  
  // store the direction
  this._volumeRenderingDirection = direction;
  
  this.dirty = false;
  
};


/**
 * Return the label map of this volume. A new label map gets created if required
 * (Singleton).
 * 
 * @return {!X.volume}
 */
X.volume.prototype.labelMap = function() {

  if (!this._labelMap) {
    
    this._labelMap = new X.labelMap(this);
    
  }
  
  return this._labelMap;
  
};


/**
 * Return the borders flag.
 * 
 * @return {boolean} TRUE if borders are enabled, FALSE otherwise.
 */
X.volume.prototype.borders = function() {

  return this._borders;
  
};


/**
 * Set the borders flag. Must be called before the volume gets created
 * internally. After that, the borders can be modified using the children of
 * each slice.
 * 
 * @param {boolean} borders TRUE to enable borders, FALSE to disable them.
 */
X.volume.prototype.setBorders = function(borders) {

  this._borders = borders;
  
};

// export symbols (required for advanced compilation)
goog.exportSymbol('X.volume', X.volume);
goog.exportSymbol('X.volume.prototype.dimensions',
    X.volume.prototype.dimensions);
goog.exportSymbol('X.volume.prototype.scalarRange',
    X.volume.prototype.scalarRange);
goog.exportSymbol('X.volume.prototype.setVisible',
    X.volume.prototype.setVisible);
goog.exportSymbol('X.volume.prototype.setCenter', X.volume.prototype.setCenter);
goog.exportSymbol('X.volume.prototype.setVolumeRendering',
    X.volume.prototype.setVolumeRendering);
goog.exportSymbol('X.volume.prototype.threshold', X.volume.prototype.threshold);
goog.exportSymbol('X.volume.prototype.modified', X.volume.prototype.modified);
goog.exportSymbol('X.volume.prototype.labelMap', X.volume.prototype.labelMap);
goog.exportSymbol('X.volume.prototype.borders', X.volume.prototype.borders);
goog.exportSymbol('X.volume.prototype.setBorders',
    X.volume.prototype.setBorders);
