(function(){
  var App = Backbone.Model.extend({
    "$": function(query) {
      return this.$el.find(query);
    },
    initialize: function(q){
      this.el = document.createElement("div");
      this.el.className = "dataflow";
      this.$el = $(this.el);
      var menu = $('<div class="menu">');
      var self = this;
      var menuClose = $('<button class="btn menu-close"><i class="icon-remove"></i></button>')
        .click( function(){ self.hideMenu(); } )
        .appendTo(menu);
      this.$el.append(menu);

      // Debug mode
      this.debug = this.get("debug");

      // Setup actionbar
      this.prepareActionBar();
      this.renderActionBar();

      // Add plugins
      for (var name in this.plugins) {
        if (this.plugins[name].initialize) {
          this.plugins[name].initialize(this);
        }
      }

      // Add the main element to the page
      var appendTo = this.get("appendTo");
      appendTo = appendTo ? appendTo : "body";
      $(appendTo).append(this.el);
    },
    prepareActionBar: function () {
      this.actionBar = new ActionBar({}, this);
      this.actionBar.get('control').set({
        label: 'Dataflow',
        icon: 'retweet'
      });
    },
    renderActionBar: function () {
      this.$el.append( this.actionBar.render() );
      this.$(".brand").attr({
        href: "https://github.com/meemoo/dataflow",
        target: "_blank"
      });
    },
    // Create the object to contain the modules
    modules: {},
    module: function(name) {
      // Create a new module reference scaffold or load an existing module.
      // If this module has already been created, return it.
      if (this.modules[name]) {
        return this.modules[name];
      }
      // Create a module scaffold and save it under this name
      this.modules[name] = {};
      return this.modules[name];
    },
    // Create the object to contain the nodes
    nodes: {},
    node: function(name) {
      // Create a new node reference scaffold or load an existing node.
      // If this node has already been created, return it.
      if (this.nodes[name]) {
        return this.nodes[name];
      }
      // Create a node scaffold and save it under this name
      this.nodes[name] = {};
      return this.nodes[name];
    },
    plugins: {},
    plugin: function(name) {
      if (this.plugins[name]) {
        return this.plugins[name];
      }
      this.plugins[name] = {};
      return this.plugins[name];
    },
    hideMenu: function () {
      this.$el.removeClass("menu-shown");
    },
    showMenu: function (id) {
      this.$el.addClass("menu-shown");
      this.$(".menuitem").removeClass("shown");
      this.plugins[id].menu.addClass("shown");
    },
    addPlugin: function(info) {
      if (info.menu) {
        var menu = $("<div>")
          .addClass("menuitem menuitem-"+info.id)
          .append(info.menu);
        this.$(".menu").append( menu );
        this.plugins[info.id].menu = menu;

        this.actionBar.get('actions').add({
          id: info.id,
          icon: info.icon,
          label: info.name,
          action: function(){ this.showMenu(info.id); }
        });
      }
    },
    loadGraph: function(source) {
      if (this.graph) {
        if (this.currentGraph.view) {
          this.currentGraph.view.remove();
        }
        if (this.graph.view) {
          this.graph.view.remove();
        }
        this.graph.remove();
      }
      var Graph = this.module("graph");

      source.dataflow = this;
      var newGraph = new Graph.Model(source);
      newGraph.view = new Graph.View({model: newGraph});
      this.$el.append(newGraph.view.render().el);

      // For debugging
      this.graph = this.currentGraph = newGraph;

      return newGraph;
    },
    showGraph: function(graph){
      // Hide current
      this.currentGraph.view.$el.detach();
      // Show new
      this.$el.append(graph.view.el);
      graph.view.render();
      this.currentGraph = graph;
    },
    debug: false,
    log: function(message) {
      this.trigger("log", message, arguments);
      if (this.debug) {
        console.log("Dataflow: ", arguments);
      }
    },
    types: [
      "all",
      "canvas:2d",
      "canvas:webgl",
      "string",
      "number",
      "int",
      "object",
      "array"
    ]
  });

  // Our global
  window.Dataflow = App;

  // Backbone hacks
  // Discussed here http://stackoverflow.com/a/13075845/592125
  Backbone.View.prototype.addEvents = function(events) {
    this.delegateEvents( _.extend(_.clone(this.events), events) );
  };

  // Simple collection view
  Backbone.CollectionView = Backbone.Model.extend({
    // this.tagName and this.itemView should be set
    initialize: function(){
      this.el = document.createElement(this.tagName);
      this.$el = $(this.el);
      var collection = this.get("collection");
      collection.each(this.addItem, this);
      collection.on("add", this.addItem, this);
      collection.on("remove", this.removeItem, this);
    },
    addItem: function(item){
      item.view = new this.itemView({model:item});
      this.$el.append(item.view.render().el);
    },
    removeItem: function(item){
      item.view.remove();
    }
  });

}());

// All code has been downloaded and evaluated and app is ready to be initialized.
// jQuery(function($) {

//   // Router
//   var DataflowRouter = Backbone.Router.extend({
//     routes: {
//       "": "index"
//     },
//     index: function() {

//     }
//   });
//   Dataflow.router = new DataflowRouter();
//   Backbone.history.start();

// });
