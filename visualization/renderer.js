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
goog.provide('X.renderer');

// requires
goog.require('X.array');
goog.require('X.base');
goog.require('X.camera');
goog.require('X.camera2D');
goog.require('X.camera3D');
goog.require('X.event');
goog.require('X.interactor');
goog.require('X.interactor2D');
goog.require('X.interactor3D');
goog.require('X.labelMap');
goog.require('X.loader');
goog.require('X.object');
goog.require('X.progressbar');
goog.require('X.volume');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('goog.Timer');



/**
 * The superclass for all renderers.
 * 
 * @constructor
 * @param {!Element} container The container (DOM Element) to place the renderer
 *          inside.
 * @extends X.base
 */
X.renderer = function(container) {

  // check if a container is passed
  if (!goog.isDefAndNotNull(container)) {
    
    throw new Error('An ID to a valid container (<div>..) is required.');
    
  }
  
  // check if the passed container is really valid
  var _container = goog.dom.getElement(container);
  
  if (!goog.dom.isElement(_container) || _container.clientWidth == 0 ||
      _container.clientHeight == 0) {
    
    throw new Error(
        'Could not find the given container or it has an undefined size.');
    
  }
  
  //
  // call the standard constructor of X.base
  goog.base(this);
  
  /**
   * @inheritDoc
   * @const
   */
  this['className'] = 'renderer';
  
  /**
   * The HTML container of this renderer, E.g. a <div>.
   * 
   * @type {!Element}
   * @public
   */
  this['container'] = _container;
  
  /**
   * The width of this renderer.
   * 
   * @type {!number}
   * @public
   */
  this['width'] = this['container'].clientWidth;
  
  /**
   * The height of this renderer.
   * 
   * @type {!number}
   * @public
   */
  this['height'] = this['container'].clientHeight;
  
  /**
   * The Canvas of this renderer.
   * 
   * @type {?Element}
   * @public
   */
  this['canvas'] = null;
  
  /**
   * The camera of this renderer.
   * 
   * @type {?X.camera}
   * @protected
   */
  this['camera'] = null;
  
  /**
   * The interactor of this renderer.
   * 
   * @type {?X.interactor}
   * @protected
   */
  this['interactor'] = null;
  
  /**
   * An X.array containing the displayable objects of this renderer. The object
   * reflects the rendering order for the associated objects.
   * 
   * @type {!X.array}
   * @protected
   */
  this.objects = new X.array(X.object.OPACITY_COMPARATOR);
  
  /**
   * An array containing the topLevel objects (which do not have parents) of
   * this renderer.
   * 
   * @type {!Array}
   * @protected
   */
  this.topLevelObjects = new Array();
  
  /**
   * The loader associated with this renderer.
   * 
   * @type {?X.loader}
   * @protected
   */
  this.loader = null;
  
  /**
   * A locked flag for synchronizing.
   * 
   * @type {boolean}
   * @protected
   */
  this.locked = false;
  
  /**
   * A flag to show if the initial loading was completed.
   * 
   * @type {boolean}
   * @public
   */
  this['initialLoadingCompleted'] = false;
  
  /**
   * The progressBar of this renderer.
   * 
   * @type {?X.progressbar}
   * @protected
   */
  this.progressBar = null;
  
  /**
   * The rendering context of this renderer.
   * 
   * @type {?Object}
   * @protected
   */
  this.context = null;
  
  /**
   * The configuration of this renderer.
   * 
   * @enum {boolean}
   */
  this['config'] = {
    'PROGRESSBAR_ENABLED': true
  };
  
  window.console.log('XTK Release 4 -- 04/12/12 -- http://www.goXTK.com');
  
};
// inherit from X.base
goog.inherits(X.renderer, X.base);


/**
 * The callback for X.event.events.PROGRESS events which indicate progress
 * updates during loading.
 * 
 * @param {!X.event.ProgressEvent} event The progress event holding the total
 *          progress value.
 * @public
 */
X.renderer.prototype.onProgress = function(event) {

  if (this.progressBar) {
    
    var _progress = event.value;
    this.progressBar.setValue(_progress * 100);
    
  }
  
};


/**
 * The callback for X.event.events.MODIFIED events which re-configures the
 * object for rendering. This does not trigger re-rendering.
 * 
 * @param {!X.event.ModifiedEvent} event The modified event pointing to the
 *          modified object.
 * @public
 */
X.renderer.prototype.onModified = function(event) {

  if (goog.isDefAndNotNull(event) && event instanceof X.event.ModifiedEvent) {
    
    this.update_(event.object);
    
  }
  
};


/**
 * The callback for X.event.events.HOVER events which indicate a hovering over
 * the viewport.
 * 
 * @param {!X.event.HoverEvent} event The hover event pointing to the relevant
 *          screen coordinates.
 * @throws {Error} An error if the given event is invalid.
 * @protected
 */
X.renderer.prototype.onHover_ = function(event) {

  if (!goog.isDefAndNotNull(event) || !(event instanceof X.event.HoverEvent)) {
    
    throw new Error('Invalid hover event.');
    
  }
  
};


/**
 * The callback for X.event.events.SCROLL events which indicate scrolling of the
 * viewport.
 * 
 * @param {!X.event.ScrollEvent} event The scroll event indicating the scrolling
 *          direction.
 * @throws {Error} An error if the given event is invalid.
 * @protected
 */
X.renderer.prototype.onScroll_ = function(event) {

  if (!goog.isDefAndNotNull(event) || !(event instanceof X.event.ScrollEvent)) {
    
    throw new Error('Invalid scroll event.');
    
  }
  
};


/**
 * Resets the view according to the global bounding box of all associated
 * objects, the configured camera position as well as its focus _and_ triggers
 * re-rendering.
 */
X.renderer.prototype.resetViewAndRender = function() {

  this['camera'].reset();
  this.render_(false, false);
  
};


/**
 * Shows the loading progress bar by modifying the DOM tree.
 * 
 * @protected
 */
X.renderer.prototype.showProgressBar_ = function() {

  // only do the following if the progressBar was not turned off
  if (this['config']['PROGRESSBAR_ENABLED']) {
    
    // create a progress bar here if this is the first render request and the
    // loader is working
    if (!this.progressBar) {
      
      this.progressBar = new X.progressbar(this['container'], 3);
      
    }
    
  }
  
};


/**
 * Hides the loading progress bar.
 * 
 * @protected
 */
X.renderer.prototype.hideProgressBar_ = function() {

  // only do the following if the progressBar was not turned off
  if (this['config']['PROGRESSBAR_ENABLED']) {
    
    if (this.progressBar && !this._readyCheckTimer2) {
      
      // show a green, full progress bar
      this.progressBar.done();
      
      // wait for a short time
      this._readyCheckTimer2 = goog.Timer.callOnce(function() {

        this._readyCheckTimer2 = null;
        
        if (this.progressBar) {
          
          // we are done, kill the progressbar
          this.progressBar.kill();
          this.progressBar = null;
          
        }
        
        this.render();
        
      }.bind(this), 700);
      // .. and jump out
      return;
      
    } // if progressBar still exists
    
  } // if progressBar is enabled
  
};


/**
 * Create the canvas of this renderer inside the configured container and using
 * attributes like width, height etc. Then, initialize the rendering context and
 * attach all necessary objects (e.g. camera, shaders..). Finally, initialize
 * the event listeners.
 * 
 * @param {string} _contextName The name of the context to create.
 * @throws {Error} An exception if there were problems during initialization.
 * @protected
 */
X.renderer.prototype.init = function(_contextName) {

  // create the canvas
  var _canvas = goog.dom.createDom('canvas');
  
  // width and height can not be set using CSS but via object properties
  _canvas.width = this['width'];
  _canvas.height = this['height'];
  
  //
  // append it to the container
  goog.dom.appendChild(this['container'], _canvas);
  

  // --------------------------------------------------------------------------
  //
  // Viewport initialization
  //
  
  //
  // Step1: Get Context of canvas
  //
  try {
    
    var _context = _canvas.getContext(_contextName);
    
    if (!_context) {
      
      // this exception triggers the display of the error message
      // because the context creation can either fail with an exception
      // or return a NULL context
      throw new Error();
      
    }
    
  } catch (e) {
    
    // Canvas2D is not supported with this browser/machine/gpu
    
    // attach a message to the container's inner HTML
    var _style = "color:red;font-family:sans-serif;";
    var _msg = 'Sorry, ' +
        _contextName +
        ' context is <strong>not supported</strong> on this machine! See <a href="http://crash.goXTK.com" target="_blank">http://crash.goXTK.com</a> for requirements..';
    this['container'].innerHTML = '<h3 style="' + _style +
        '">Oooops..</h3><p style="' + _style + '">' + _msg + '</p>';
    
    // .. and throw an exception
    throw new Error(_msg);
    
  }
  
  //
  // Step 1b: Configure the X.loader
  //
  this.loader = new X.loader();
  
  // listen to a progress event which gets fired during loading whenever
  // progress was made
  goog.events.listen(this.loader, X.event.events.PROGRESS, this.onProgress
      .bind(this));
  
  //
  // Step 1c: Register the created canvas to this instance
  //
  this['canvas'] = _canvas;
  
  //
  // Step 1d: Register the created context to this instance
  //
  this.context = _context;
  
  //
  // Step2: Configure the context and the viewport
  //
  
  //
  // create a new interactor
  var _interactor = new X.interactor3D(this['canvas']);
  
  // in the 2d case, create a 2d interactor (of course..)
  if (_contextName == '2d') {
    
    _interactor = new X.interactor2D(this['canvas']);
    
  }
  // initialize it and..
  _interactor.init();
  
  // .. listen to resetViewEvents
  goog.events.listen(_interactor, X.event.events.RESETVIEW,
      this.resetViewAndRender.bind(this));
  // .. listen to hoverEvents
  goog.events.listen(_interactor, X.event.events.HOVER, this.onHover_
      .bind(this));
  // .. listen to scroll events
  goog.events.listen(_interactor, X.event.events.SCROLL, this.onScroll_
      .bind(this));
  

  // .. and finally register it to this instance
  this['interactor'] = _interactor;
  
  //
  // create a new camera
  // width and height are required to calculate the perspective
  var _camera = new X.camera3D(this['width'], this['height']);
  
  if (_contextName == '2d') {
    _camera = new X.camera2D(this['width'], this['height']);
  }
  // observe the interactor for user interactions (mouse-movements etc.)
  _camera.observe(this['interactor']);
  // ..listen to render requests from the camera
  // these get fired after user-interaction and camera re-positioning to re-draw
  // all objects
  goog.events.listen(_camera, X.event.events.RENDER, this.render_.bind(this,
      false, false));
  
  //
  // attach all created objects as class attributes
  // should be one of the last things to do here since we use these attributes
  // to check if the initialization was completed successfully
  this['camera'] = _camera;
  

  //
  //
  // .. the rest should be performed in the subclasses
  
};


/**
 * Add a new object to this renderer. The renderer has to be initialized before
 * doing so. A X.renderer.render() call has to be initiated to display added
 * objects.
 * 
 * @param {!X.object} object The object to add to this renderer.
 * @throws {Error} An exception if something goes wrong.
 */
X.renderer.prototype.add = function(object) {

  // we know that objects which are directly added using this function are def.
  // top-level objects, meaning that they do not have a parent
  this.topLevelObjects.push(object);
  
  this.update_(object);
  
};


/**
 * Configure a displayable object within this renderer. The object can be a
 * newly created one or an existing one. A X.renderer.render() call has to be
 * initiated to display the object.
 * 
 * @param {!X.object} object The displayable object to setup within this
 *          renderer.
 * @throws {Error} An exception if something goes wrong.
 * @protected
 */
X.renderer.prototype.update_ = function(object) {

  if (!this['canvas'] || !this.context) {
    
    throw new Error('The renderer was not initialized properly.');
    
  }
  
  if (!goog.isDefAndNotNull(object)) {
    window.console.log(object);
    throw new Error('Illegal object.');
    
  }
  
  // listen to modified events of this object, if we didn't do that before
  if (!goog.events.hasListener(object, X.event.events.MODIFIED)) {
    
    goog.events.listen(object, X.event.events.MODIFIED, this.onModified
        .bind(this));
    
  }
  
};


/**
 * Get the existing X.object with the given id.
 * 
 * @param {!number} id The object's id.
 * @return {?X.object} The requested X.object or null if it was not found.
 * @throws {Error} If the given id was invalid.
 * @public
 */
X.renderer.prototype.get = function(id) {

  if (!goog.isDefAndNotNull(id)) {
    
    throw new Error('Invalid object id.');
    
  }
  
  // loop through objects and try to find the id
  var _objects = this.objects.values();
  var _numberOfObjects = _objects.length;
  
  var _k = 0;
  for (_k = 0; _k < _numberOfObjects; _k++) {
    
    if (_objects[_k]['_id'] == id) {
      
      // found!
      return _objects[_k];
      
    }
    
  }
  
  // not found
  return null;
  
};


/**
 * Print the full hierarchy tree of objects.
 * 
 * @public
 */
X.renderer.prototype.printScene = function() {

  var _numberOfTopLevelObjects = this.topLevelObjects.length;
  
  var _y;
  for (_y = 0; _y < _numberOfTopLevelObjects; _y++) {
    
    var _topLevelObject = this.topLevelObjects[_y];
    
    this.generateTree_(_topLevelObject, 0);
    
  }
  
};


/**
 * Recursively loop through a hierarchy tree of objects and print it.
 * 
 * @param {!X.object} object The starting point object.
 * @param {number} level The current level in the scene hierarchy.
 * @protected
 */
X.renderer.prototype.generateTree_ = function(object, level) {

  var _output = "";
  
  var _l = 0;
  for (_l = 0; _l < level; _l++) {
    
    _output += ">";
    
  }
  
  _output += object['_id'];
  
  window.console.log(_output);
  
  if (object.hasChildren()) {
    
    // loop through the children
    var _children = object.children();
    var _numberOfChildren = _children.length;
    var _c = 0;
    
    for (_c = 0; _c < _numberOfChildren; _c++) {
      
      this.generateTree_(_children[_c], level + 1);
      
    }
    
  }
  
};


/**
 * (Re-)render all associated displayable objects of this renderer. This method
 * clears the viewport and re-draws everything by looping through the tree of
 * objects. The current camera is used to setup the world space.
 * 
 * @public
 */
X.renderer.prototype.render = function() {

  if (!this['canvas'] || !this.context) {
    
    throw new Error('The renderer was not initialized properly.');
    
  }
  
  // READY CHECK
  //
  // now we check if we are ready to display everything
  // - ready means: all textures loaded and setup, all external files loaded and
  // setup and all other objects loaded and setup
  //
  // if we are not ready, we wait..
  // if we are ready, we continue with the rendering
  
  // let's check if render() was called before and the single-shot timer is
  // already there
  // f.e., if we are in a setInterval-configured render loop, we do not want to
  // create multiple single-shot timers
  if (goog.isDefAndNotNull(this.readyCheckTimer)) {
    
    return;
    
  }
  
  //
  // LOADING..
  //
  if (!this.loader.completed()) {
    
    // we are not ready yet.. the loader is still working;
    
    this.showProgressBar_();
    
    // let's check again in a short time
    this.readyCheckTimer = goog.Timer.callOnce(function() {

      this.readyCheckTimer = null; // destroy the timer
      
      // try to render now..
      // if the loader is ready it will work, else wise another single-shot gets
      // configured in 500 ms
      this.render();
      
    }.bind(this), 100); // check again in 500 ms
    
    return; // .. and jump out
    
  } else if (this.progressBar) {
    
    // we are ready! yahoooo!
    // this means the X.loader is done..
    this.hideProgressBar_();
    
    // call the onShowtime function which can be overloaded
    eval("this.onShowtime()");
    this['_initialLoadingCompleted'] = true; // flag the renderer as 'initial
    // loading completed'
    
    // .. we exit here since the hiding takes some time and automatically
    // triggers the rendering when done
    return;
    
  }
  //
  // END OF LOADING
  //
  
  //
  // CURTAIN UP! LET THE SHOW BEGIN..
  //
  this.render_(false, true);
  
};


/**
 * Overload this function to execute code after all initial loading (files,
 * textures..) has completed and just before the first real rendering call.
 * 
 * @public
 */
X.renderer.prototype.onShowtime = function() {

  // do nothing
};


/**
 * Internal function to perform the actual rendering by looping through all
 * associated X.objects.
 * 
 * @param {boolean} picking If TRUE, perform picking - if FALSE render to the
 *          canvas viewport.
 * @param {?boolean=} invoked If TRUE, the render counts as invoked and f.e.
 *          statistics are generated.
 * @throws {Error} If anything goes wrong.
 * @protected
 */
X.renderer.prototype.render_ = function(picking, invoked) {

  

};


/**
 * Destroy this renderer.
 * 
 * @public
 */
X.renderer.prototype.destroy = function() {

  // remove all objects
  this.objects.clear();
  delete this.objects;
  this.topLevelObjects.length = 0;
  delete this.topLevelObjects;
  
  // remove loader, camera and interactor
  delete this.loader;
  this.loader = null;
  
  delete this['camera'];
  this['camera'] = null;
  
  delete this['interactor'];
  this['interactor'] = null;
  
  // remove the rendering context
  delete this.context;
  this.context = null;
  
  // remove the canvas from the dom tree
  goog.dom.removeNode(this['canvas']);
  delete this['canvas'];
  this['canvas'] = null;
  
};
