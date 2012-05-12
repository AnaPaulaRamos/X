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
goog.provide('X.parserLUT');

// requires
goog.require('X.event');
goog.require('X.parser');
goog.require('X.triplets');



/**
 * Create a parser for color maps (look-up tables).
 * 
 * @constructor
 * @extends X.parser
 */
X.parserLUT = function() {

  //
  // call the standard constructor of X.base
  goog.base(this);
  
  //
  // class attributes
  
  /**
   * @inheritDoc
   * @const
   */
  this['className'] = 'parserLUT';
  
};
// inherit from X.parser
goog.inherits(X.parserLUT, X.parser);


/**
 * @inheritDoc
 */
X.parserLUT.prototype.parse = function(object, data, colorTable) {

  var dataAsArray = data.split('\n');
  
  var numberOfLines = dataAsArray.length;
  
  var i;
  for (i = 0; i < numberOfLines; ++i) {
    
    var line = dataAsArray[i];
    
    // trim the line
    line = line.replace(/^\s+|\s+$/g, '');
    
    // ignore comments
    if (line[0] == '#') {
      continue;
    }
    
    // split each line
    var lineFields = line.split(' ');
    
    // filter out multiple blanks
    lineFields = lineFields.filter(function(v) {

      return v != '';
      
    });
    
    // check if we have 6 values
    if (lineFields.length != 6) {
      
      // ignore this line
      continue;
      
    }
    
    // here, we have a valid array containing
    // labelValue, labelName, r, g, b, a
    
    // convert r, g, b, a to the range 0..1 and don't forget to make it a number
    lineFields[2] = parseInt(lineFields[2], 10) / 255; // r
    lineFields[3] = parseInt(lineFields[3], 10) / 255; // g
    lineFields[4] = parseInt(lineFields[4], 10) / 255; // b
    lineFields[5] = parseInt(lineFields[5], 10) / 255; // a
    
    // .. push it
    colorTable.add(parseInt(lineFields[0], 10), lineFields[1], lineFields[2],
        lineFields[3], lineFields[4], lineFields[5], 10);
    
  }
  
  var modifiedEvent = new X.event.ModifiedEvent();
  modifiedEvent.object = object;
  this.dispatchEvent(modifiedEvent);
  
};


// export symbols (required for advanced compilation)
goog.exportSymbol('X.parserLUT', X.parserLUT);
goog.exportSymbol('X.parserLUT.prototype.parse', X.parserLUT.prototype.parse);
