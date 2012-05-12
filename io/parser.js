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

goog.provide('X.parser');

// requires
goog.require('X.base');
goog.require('X.event');



/**
 * Create a parser for binary or ascii data.
 * 
 * @constructor
 * @extends X.base
 */
X.parser = function() {

  //
  // call the standard constructor of X.base
  goog.base(this);
  
  //
  // class attributes
  
  /**
   * @inheritDoc
   * @const
   */
  this['className'] = 'parser';
  
};
// inherit from X.base
goog.inherits(X.parser, X.base);


/**
 * Parse data and configure the given object. When complete, a
 * X.parser.ModifiedEvent is fired.
 * 
 * @param {!X.object} object The object to configure.
 * @param {!String} data The data to parse.
 * @throws {Error} An exception if something goes wrong.
 */
X.parser.prototype.parse = function(object, data) {

  throw new Error('The function parse() should be overloaded.');
  
};


/**
 * Process a numerical array and calculate some basic stats: o mean o variance o
 * deviation o prod o sum o min; minIndex o max; maxIndex
 * 
 * @param {*} data The numerical data array to process.
 */
X.parser.prototype.stats_calc = function(data) {

  var r = {
    mean: 0,
    variance: 0,
    deviation: 0,
    prod: 1,
    sum: 0,
    min: 0,
    minIndex: 0,
    max: 0,
    maxIndex: 0
  };
  var t = data.length;
  r.size = t;
  for ( var m = 0, p = 1, s = 0, l = t; l >= 0; l--) {
    s += data[l];
    p *= data[l];
    if (r.min >= data[l]) {
      r.min = data[l];
      r.minIndex = l;
    }
    if (r.max <= data[l]) {
      r.max = data[l];
      r.maxIndex = l;
    }
  }
  ;
  r.prod = p;
  r.sum = s;
  for (m = r.mean = s / t, l = t, s = 0; l--; s += Math.pow(data[l] - m, 2)) {
    ;
  }
  return r.deviation = Math.sqrt(r.variance = s / t), r;
};

// Some parse functions were inspired by Dan Ginsburg, Children's Hospital
// Boston (see LICENSE)

X.parser.prototype.parseString = function(data, offset, length) {

  return data.substr(offset, length);
  
};


X.parser.prototype.parseFloat32 = function(data, offset) {

  var b3 = this.parseUChar8(data, offset), b2 = this.parseUChar8(data,
      offset + 1), b1 = this.parseUChar8(data, offset + 2), b0 = this
      .parseUChar8(data, offset + 3),

  sign = 1 - (2 * (b0 >> 7)), exponent = (((b0 << 1) & 0xff) | (b1 >> 7)) - 127, mantissa = ((b1 & 0x7f) << 16) |
      (b2 << 8) | b3;
  
  if (mantissa == 0 && exponent == -127) {
    return 0.0;
  }
  
  return sign * (1 + mantissa * Math.pow(2, -23)) * Math.pow(2, exponent);
  
};


X.parser.prototype.parseFloat32EndianSwapped = function(data, offset) {

  var b0 = this.parseUChar8(data, offset), b1 = this.parseUChar8(data,
      offset + 1), b2 = this.parseUChar8(data, offset + 2), b3 = this
      .parseUChar8(data, offset + 3),

  sign = 1 - (2 * (b0 >> 7)), exponent = (((b0 << 1) & 0xff) | (b1 >> 7)) - 127, mantissa = ((b1 & 0x7f) << 16) |
      (b2 << 8) | b3;
  
  if (mantissa == 0 && exponent == -127) {
    return 0.0;
  }
  
  return sign * (1 + mantissa * Math.pow(2, -23)) * Math.pow(2, exponent);
  
};


X.parser.prototype.parseFloat32Array = function(data, offset, elements) {

  var arr = new Array();
  
  var max = 0;
  var min = Infinity;
  
  var i;
  for (i = 0; i < elements; i++) {
    var val = this.parseFloat32(data, offset + (i * 4));
    arr[i] = val;
    max = Math.max(max, val);
    min = Math.min(min, val);
  }
  
  return [arr, max, min];
};


X.parser.prototype.parseFloat32EndianSwappedArray = function(data, offset,
    elements) {

  var arr = new Array();
  
  var max = 0;
  var min = Infinity;
  
  var i;
  for (i = 0; i < elements; i++) {
    var val = this.parseFloat32EndianSwapped(data, offset + (i * 4));
    arr[i] = val;
    max = Math.max(max, val);
    min = Math.min(min, val);
  }
  
  return [arr, max, min];
};


X.parser.prototype.parseUInt32 = function(data, offset) {

  var b0 = this.parseUChar8(data, offset), b1 = this.parseUChar8(data,
      offset + 1), b2 = this.parseUChar8(data, offset + 2), b3 = this
      .parseUChar8(data, offset + 3);
  
  return (b3 << 24) + (b2 << 16) + (b1 << 8) + b0;
};

X.parser.prototype.parseUInt32EndianSwapped = function(data, offset) {

  var b0 = this.parseUChar8(data, offset), b1 = this.parseUChar8(data,
      offset + 1), b2 = this.parseUChar8(data, offset + 2), b3 = this
      .parseUChar8(data, offset + 3);
  
  return (b0 << 24) + (b1 << 16) + (b2 << 8) + b3;
};


X.parser.prototype.parseUInt32EndianSwappedArray = function(data, offset,
    elements) {

  var arr = new Array();
  
  var max = 0;
  var min = Infinity;
  
  var i;
  for (i = 0; i < elements; i++) {
    var val = this.parseUInt32EndianSwapped(data, offset + (i * 4));
    arr[i] = val;
    max = Math.max(max, val);
    min = Math.min(min, val);
  }
  
  return [arr, max, min];
};


X.parser.prototype.parseUInt24EndianSwapped = function(data, offset) {

  var b0 = this.parseUChar8(data, offset), b1 = this.parseUChar8(data,
      offset + 1), b2 = this.parseUChar8(data, offset + 2);
  

  return ((b0 << 16) + (b1 << 8) + (b2)) & 0x00FFFFFF;
};

X.parser.prototype.parseUInt16 = function(data, offset) {

  var b0 = this.parseUChar8(data, offset), b1 = this.parseUChar8(data,
      offset + 1);
  
  return (b1 << 8) + b0;
  
};

X.parser.prototype.parseUInt16Array = function(data, offset, elements) {

  var arr = new Array();
  

  var max = 0;
  var min = Infinity;
  
  var i;
  for (i = 0; i < elements; i++) {
    var val = this.parseUInt16(data, offset + (i * 2));
    arr[i] = val;
    max = Math.max(max, val);
    min = Math.min(min, val);
  }
  
  return [arr, max, min];
};


X.parser.prototype.parseUInt16EndianSwapped = function(data, offset) {

  var b0 = this.parseUChar8(data, offset);
  var b1 = this.parseUChar8(data, offset + 1);
  
  return (b0 << 8) + b1;
  
};


X.parser.prototype.parseUInt16EndianSwappedArray = function(data, offset,
    elements) {

  var arr = new Array();
  
  var max = 0;
  var min = Infinity;
  
  var i;
  for (i = 0; i < elements; i++) {
    var val = this.parseUInt16EndianSwapped(data, offset + (i * 2));
    arr[i] = val;
    max = Math.max(max, val);
    min = Math.min(min, val);
  }
  
  return [arr, max, min];
};


X.parser.prototype.parseSChar8 = function(data, offset) {

  var b = this.parseUChar8(data, offset);
  return b > 127 ? b - 256 : b;
  
};

X.parser.prototype.parseUChar8 = function(data, offset) {

  return data.charCodeAt(offset) & 0xff;
};


X.parser.prototype.parseUChar8Array = function(data, offset, elements) {

  var arr = new Array();
  
  var max = 0;
  var min = Infinity;
  
  var i;
  for (i = 0; i < elements; i++) {
    var val = this.parseUChar8(data, offset + (i));
    arr[i] = val;
    max = Math.max(max, val);
    min = Math.min(min, val);
  }
  
  return [arr, max, min];
};


X.parser.prototype.reslice = function(object, datastream, sizes, min, max) {

  // number of slices in scan direction
  var slices = sizes[2];
  // number of rows in each slice in scan direction
  var rowsCount = sizes[1];
  // number of cols in each slice in scan direction
  var colsCount = sizes[0];
  
  // do we have a labelMap?
  var hasLabelMap = object._labelMap != null;
  
  // do we have a color table?
  var _hasColorTable = object._colorTable != null;
  var _colorTableMap = null;
  if (_hasColorTable) {
    // color table!
    _colorTableMap = object._colorTable.map;
  }
  
  // slice dimensions in scan direction
  var numberPixelsPerSlice = rowsCount * colsCount;
  
  // allocate 3d image array [slices][rows][cols]
  var image = new Array(slices);
  for ( var iS = 0; iS < slices; iS++) {
    image[iS] = new Array(rowsCount);
    for ( var iR = 0; iR < rowsCount; iR++) {
      image[iS][iR] = new Array(colsCount);
    }
  }
  
  var pixelValue = 0;
  
  // loop through all slices in scan direction
  //
  // this step creates the slices in X-direction and fills the 3d image array at
  // the same time
  // combining the two operations saves some time..
  var z = 0;
  for (z = 0; z < slices; z++) {
    
    // grab the pixels for the current slice z
    var currentSlice = datastream.slice(z * (numberPixelsPerSlice), (z + 1) *
        numberPixelsPerSlice);
    // the texture has 3 times the pixel value + 1 opacity value for all pixels
    var textureForCurrentSlice = new Uint8Array(4 * numberPixelsPerSlice);
    
    // now loop through all pixels of the current slice
    var row = 0;
    var col = 0;
    var p = 0; // just a counter
    
    for (row = 0; row < rowsCount; row++) {
      for (col = 0; col < colsCount; col++) {
        
        // map pixel values
        pixelValue = currentSlice[p];
        var pixelValue_r = 0;
        var pixelValue_g = 0;
        var pixelValue_b = 0;
        var pixelValue_a = 0;
        if (_hasColorTable) {
          // color table!
          var lookupValue = _colorTableMap.get(Math.floor(pixelValue));
          
          // check for out of range and use the last label value in this case
          if (!lookupValue) {
            lookupValue = _colorTableMap.get(_colorTableMap.getCount() - 1);
          }
          
          pixelValue_r = 255 * lookupValue[1];
          pixelValue_g = 255 * lookupValue[2];
          pixelValue_b = 255 * lookupValue[3];
          pixelValue_a = 255 * lookupValue[4];
        } else {
          // no color table, 1-channel gray value
          pixelValue_r = pixelValue_g = pixelValue_b = 255 * (pixelValue / max);
          pixelValue_a = 255;
        }
        
        var textureStartIndex = p * 4;
        textureForCurrentSlice[textureStartIndex] = pixelValue_r;
        textureForCurrentSlice[++textureStartIndex] = pixelValue_g;
        textureForCurrentSlice[++textureStartIndex] = pixelValue_b;
        textureForCurrentSlice[++textureStartIndex] = pixelValue_a;
        
        // save the pixelValue in the 3d image data
        image[z][row][col] = pixelValue;
        
        p++;
        
      }
      
    }
    
    // create the texture for slices in X-direction
    var pixelTexture = new X.texture();
    pixelTexture.setRawData(textureForCurrentSlice);
    pixelTexture.setRawDataWidth(colsCount);
    pixelTexture.setRawDataHeight(rowsCount);
    
    currentSlice = object._slicesZ.children()[z];
    currentSlice.setTexture(pixelTexture);
    if (hasLabelMap) {
      
      // if this object has a labelMap,
      // we have it loaded at this point (for sure)
      // ..so we can attach it as the second texture to this slice
      currentSlice._labelMap = object._labelMap._slicesZ.children()[z]
          .texture();
      
    }
    
  }
  
  // the following parses the 3d image array according to the Y- and the
  // Z-direction of the slices
  // this was unrolled for more performance
  
  // for Y-direction
  // all slices are along the rows of the image
  // all rows are along the slices of the image
  // all cols are along the cols of the image
  //  
  for (row = 0; row < rowsCount; row++) {
    
    var textureForCurrentSlice = new Uint8Array(4 * slices * colsCount);
    var p = 0; // just a counter
    for (z = 0; z < slices; z++) {
      for (col = 0; col < colsCount; col++) {
        
        pixelValue = image[z][row][col];
        var pixelValue_r = 0;
        var pixelValue_g = 0;
        var pixelValue_b = 0;
        var pixelValue_a = 0;
        if (_hasColorTable) {
          // color table!
          var lookupValue = _colorTableMap.get(Math.floor(pixelValue));
          
          // check for out of range and use the last label value in this case
          if (!lookupValue) {
            lookupValue = _colorTableMap.get(_colorTableMap.getCount() - 1);
          }
          
          pixelValue_r = 255 * lookupValue[1];
          pixelValue_g = 255 * lookupValue[2];
          pixelValue_b = 255 * lookupValue[3];
          pixelValue_a = 255 * lookupValue[4];
        } else {
          // no color table, 1-channel gray value
          pixelValue_r = pixelValue_g = pixelValue_b = 255 * (pixelValue / max);
          pixelValue_a = 255;
        }
        
        var textureStartIndex = p * 4;
        textureForCurrentSlice[textureStartIndex] = pixelValue_r;
        textureForCurrentSlice[++textureStartIndex] = pixelValue_g;
        textureForCurrentSlice[++textureStartIndex] = pixelValue_b;
        textureForCurrentSlice[++textureStartIndex] = pixelValue_a;
        
        p++;
        
      }
    }
    
    var pixelTexture = new X.texture();
    pixelTexture.setRawData(textureForCurrentSlice);
    pixelTexture.setRawDataWidth(colsCount);
    pixelTexture.setRawDataHeight(slices);
    
    currentSlice = object._slicesY.children()[row];
    currentSlice.setTexture(pixelTexture);
    if (hasLabelMap) {
      
      // if this object has a labelMap,
      // we have it loaded at this point (for sure)
      // ..so we can attach it as the second texture to this slice
      currentSlice._labelMap = object._labelMap._slicesY.children()[row]
          .texture();
      
    }
    
  }
  

  // for Z
  // all slices are along the cols of the image
  // all rows are along the slices of the image
  // all cols are along the rows of the image
  //  
  for (col = 0; col < colsCount; col++) {
    var textureForCurrentSlice = new Uint8Array(4 * slices * rowsCount);
    var p = 0; // just a counter
    for (z = 0; z < slices; z++) {
      for (row = 0; row < rowsCount; row++) {
        
        pixelValue = image[z][row][col];
        var pixelValue_r = 0;
        var pixelValue_g = 0;
        var pixelValue_b = 0;
        var pixelValue_a = 0;
        if (_hasColorTable) {
          // color table!
          var lookupValue = _colorTableMap.get(Math.floor(pixelValue));
          
          // check for out of range and use the last label value in this case
          if (!lookupValue) {
            lookupValue = _colorTableMap.get(_colorTableMap.getCount() - 1);
          }
          
          pixelValue_r = 255 * lookupValue[1];
          pixelValue_g = 255 * lookupValue[2];
          pixelValue_b = 255 * lookupValue[3];
          pixelValue_a = 255 * lookupValue[4];
        } else {
          // no color table, 1-channel gray value
          pixelValue_r = pixelValue_g = pixelValue_b = 255 * (pixelValue / max);
          pixelValue_a = 255;
        }
        
        var textureStartIndex = p * 4;
        textureForCurrentSlice[textureStartIndex] = pixelValue_r;
        textureForCurrentSlice[++textureStartIndex] = pixelValue_g;
        textureForCurrentSlice[++textureStartIndex] = pixelValue_b;
        textureForCurrentSlice[++textureStartIndex] = pixelValue_a;
        
        p++;
        
      }
    }
    
    var pixelTexture = new X.texture();
    pixelTexture.setRawData(textureForCurrentSlice);
    pixelTexture.setRawDataWidth(rowsCount);
    pixelTexture.setRawDataHeight(slices);
    
    currentSlice = object._slicesX.children()[col];
    currentSlice.setTexture(pixelTexture);
    if (hasLabelMap) {
      
      // if this object has a labelMap,
      // we have it loaded at this point (for sure)
      // ..so we can attach it as the second texture to this slice
      currentSlice._labelMap = object._labelMap._slicesX.children()[col]
          .texture();
      
    }
    
  }
  
};
