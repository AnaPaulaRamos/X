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
 *      'Free software' is a matter of liberty, not price.
 *      'Free' as in 'free speech', not as in 'free beer'.
 *                                         - Richard M. Stallman
 * 
 * CREDITS
 * 
 *   - the .NRRD Fileparser is based on a version of Michael Lauer (https://github.com/mrlauer/webgl-sandbox)
 *     which did not support gzip/gz encoding or other types than int/short, so we added that :)
 *   
 */

// provides
goog.provide('X.parserNRRD');

// requires
goog.require('X.event');
goog.require('X.object');
goog.require('X.parser');
goog.require('X.triplets');
goog.require('goog.math.Vec3');
goog.require('JXG.Util.Unzip');


/**
 * Create a parser for .NRRD files.
 * 
 * @constructor
 * @extends X.parser
 */
X.parserNRRD = function() {

  //
  // call the standard constructor of X.parser
  goog.base(this);
  
  //
  // class attributes
  
  /**
   * @inheritDoc
   * @const
   */
  this['className'] = 'parserNRRD';
  
};
// inherit from X.parser
goog.inherits(X.parserNRRD, X.parser);


/**
 * @inheritDoc
 */
X.parserNRRD.prototype.parse = function(object, data) {

  // the position in the file
  var position = 0;
  
  // grab the header
  var headerRegexMatch = data.match(/^([\s\S]*?)\r?\n\r?\n/);
  position = headerRegexMatch[0].length; // the one _with_ the blank line
  var header = headerRegexMatch[1]; // the one without the blank line
  
  // parse the header
  this.parseHeader(header);
  
  // now we have all kinds of things attached to this reader..
  // this was done by M. Lauer
  // I don't really like it but it works..
  
  var _data = 0; // the data without header
  
  if (this.encoding == 'gzip' || this.encoding == 'gz') {
    // we need to decompress the datastream
    _data = new JXG.Util.Unzip(data.substr(position)).unzip()[0][0];
  } else {
    // we can use the data directly
    _data = data.substr(position);
  }
  
  var numberOfPixels = this.sizes[0] * this.sizes[1] * this.sizes[2];
  
  //
  // parse the (unzipped) data to a datastream of the correct type
  //
  var datastream = new Array(numberOfPixels);
  
  // we store the min and max values to be able to convert the values to uint8
  // later
  var max = -Infinity;
  var min = Infinity;
  
  var i;
  for (i = 0; i < numberOfPixels; i++) {
    // parseFunc was defined by analyzing the nrrd header
    var pixelValue = this.parseFunc(_data, 0 + (i * this.parseBytes));
    datastream[i] = pixelValue;
    max = Math.max(max, pixelValue);
    min = Math.min(min, pixelValue);
  }
  
  //
  // we know enough to create the object
  
  // origin
  // var _origin = this['space origin'];
  // _origin = _origin.slice(1, _origin.length).split(',');
  // object._center[0] = parseFloat(_origin[0]) - this.sizes[0] / 2;
  // object._center[1] = parseFloat(_origin[1]) - this.sizes[1] / 2;
  // object._center[2] = parseFloat(_origin[2]) - this.sizes[2] / 2;
  
  // dimensions
  object._dimensions = [this.sizes[0], this.sizes[1], this.sizes[2]];
  
  // spacing
  var spacingX = new goog.math.Vec3(this.vectors[0][0], this.vectors[0][1],
      this.vectors[0][2]).magnitude();
  var spacingY = new goog.math.Vec3(this.vectors[1][0], this.vectors[1][1],
      this.vectors[1][2]).magnitude();
  var spacingZ = new goog.math.Vec3(this.vectors[2][0], this.vectors[2][1],
      this.vectors[2][2]).magnitude();
  object._spacing = [spacingX, spacingY, spacingZ];
  

  // attach the scalar range to the volume
  object._scalarRange = [min, max];
  // .. and set the default threshold
  object.threshold(min, max);
  
  // create the object
  object.create_();
  
  // now we have the values and need to reslice in the 3 orthogonal directions
  // and create the textures for each slice
  this.reslice(object, datastream, this.sizes, min, max);
  
  // all done..
  var modifiedEvent = new X.event.ModifiedEvent();
  modifiedEvent.object = object;
  this.dispatchEvent(modifiedEvent);
  
};


X.parserNRRD.prototype.parseHeader = function(header) {

  var data, field, fn, i, l, lines, m, _i, _len, _results;
  lines = header.split(/\r?\n/);
  for (_i = 0, _len = lines.length; _i < _len; _i++) {
    l = lines[_i];
    if (l.match(/NRRD\d+/)) {
      this.isNrrd = true;
    } else if (l.match(/^#/)) {
    } else if (m = l.match(/(.*):(.*)/)) {
      field = m[1].trim();
      data = m[2].trim();
      fn = this.fieldFunctions[field];
      if (fn) {
        fn.call(this, data);
      } else {
        this[field] = data;
      }
    }
  }
  if (!this.isNrrd) {
    throw new Error('Not an NRRD file');
  }
  if (this.encoding !== 'raw' && this.encoding !== 'gzip' &&
      this.encoding !== 'gz') {
    throw new Error('Only raw or gz/gzip encoding is allowed');
  }
  if (!this.vectors) {
    this.vectors = [new goog.math.Vec3(1, 0, 0), new goog.math.Vec3(0, 1, 0),
                    new goog.math.Vec3(0, 0, 1)];
    if (this.spacings) {
      _results = [];
      for (i = 0; i <= 2; i++) {
        _results.push(!isNaN(this.spacings[i]) ? this.vectors[i]
            .scale(this.spacings[i]) : void 0);
      }
      return _results;
    }
  }
};

X.parserNRRD.prototype.fieldFunctions = {
  'type': function(data) {

    switch (data) {
    case 'unsigned char':
    case 'uint8':
      this.parseFunc = this.parseUChar8;
      this.parseBytes = 1;
      break;
    case 'signed char':
    case 'int8':
      this.parseFunc = this.parseSChar8;
      this.parseBytes = 1;
      break;
    case 'short':
    case 'signed short':
    case 'unsigned short':
    case 'short int':
    case 'int16':
      this.parseFunc = this.parseUInt16;
      this.parseBytes = 2;
      break;
    case 'int':
    case 'int32':
      break;
    case 'float':
      this.parseFunc = this.parseFloat32;
      this.parseBytes = 4;
      break;
    default:
      throw new Error('Only short/int/int8/float data is allowed. Found ' +
          data);
    }
    return this.type = data;
  },
  'endian': function(data) {

    return this.endian = data;
  },
  'encoding': function(data) {

    return this.encoding = data;
  },
  'dimension': function(data) {

    return this.dim = parseInt(data, 10);
  },
  'sizes': function(data) {

    var i;
    return this.sizes = (function() {

      var _i, _len, _ref, _results;
      _ref = data.split(/\s+/);
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        i = _ref[_i];
        _results.push(parseInt(i, 10));
      }
      return _results;
    })();
  },
  'space directions': function(data) {

    var f, parts, v;
    parts = data.match(/\(.*?\)/g);
    return this.vectors = (function() {

      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = parts.length; _i < _len; _i++) {
        v = parts[_i];
        _results.push((function() {

          var _j, _len2, _ref, _results2;
          _ref = v.slice(1, -1).split(/,/);
          _results2 = [];
          for (_j = 0, _len2 = _ref.length; _j < _len2; _j++) {
            f = _ref[_j];
            _results2.push(parseFloat(f));
          }
          return _results2;
        })());
      }
      return _results;
    })();
  },
  'spacings': function(data) {

    var f, parts;
    parts = data.split(/\s+/);
    return this.spacings = (function() {

      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = parts.length; _i < _len; _i++) {
        f = parts[_i];
        _results.push(parseFloat(f));
      }
      return _results;
    })();
  }
};



// export symbols (required for advanced compilation)
goog.exportSymbol('X.parserNRRD', X.parserNRRD);
goog.exportSymbol('X.parserNRRD.prototype.parse', X.parserNRRD.prototype.parse);
