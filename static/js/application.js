/**
 * This file contains the router code as well as initializaing the application
 * namespace.
 */
window.NB=window.NB||{},window.NB.Router=Backbone.Router.extend({initialize:function(){this.route(".*","notFound"),this.route("","index"),this.route("stop/:stopId","showStop"),this.route("search/*splat","showSearch")},index:function(){var e=window.app.getView();e.showIndex()},showStop:function(e){var t=window.app.getView();t.showStopCard(e)},showSearch:function(e){var t=window.app.getView();t.showSearchCard(e)},notFound:function(){console.error("URL Not Found");return}}),window.NB.ApplicationModel=Backbone.Model.extend({defaults:{activeCard:null,stopId:null,activeModel:null}}),window.NB.RouteModel=Backbone.Model.extend({defaults:{name:null,number:null,times:null},parse:function(e){return e.times=_.map(e.times,function(e){t=e.stop_time;var n=new Date;return n.setHours(t.slice(0,2),t.slice(3,5),t.slice(6,8)),e.arrival=n.getTime(),e}),e},timeUntilToString:function(e){var t=Math.round((e-Date.now())/6e4);if(t<0)return"";var n=Math.floor(t/60),r=t-n*60;return n>9?"10h+":[n!=0?n+"h":"",r!=0?r+"m":""].join("")},stripEndpoint:function(e){var t=/^([A-Za-z]+)bound[ ]/;return e.match(t)&&(e=e.replace("bound","")),e}}),window.NB.SearchModel=Backbone.Model.extend({urlRoot:"/api/search",defaults:{query:null},loaded:!1,url:function(){var e=decodeURIComponent(this.get("query")),t=e.indexOf("|")!==-1?"geo":"text";return[this.urlRoot,t,this.get("query")].join("/")},parse:function(e){return this.loaded=!0,{results:e}},queryString:function(){var e=decodeURIComponent(this.get("query"));return e.indexOf("|")!==-1?"current location":e}}),window.NB.StopModel=Backbone.Model.extend({defaults:{id:null,name:null,routes:null},urlRoot:"/api/stops",loaded:!1,parse:function(e){var t={};return t.id=e.info.stop_id,t.name=e.info.stop_name,t.routes=[],e.routes.forEach(function(e){var n=new window.NB.RouteModel(e,{parse:!0});t.routes.push(n)}),this.loaded=!0,t},jsonifyForFavourites:function(){var e=this.toJSON();return e.routes=_.chain(this.get("routes")).map(function(e){return e.toJSON()}).pluck("number").value(),e}}),window.NB.UserModel=Backbone.Model.extend({defaults:{favourites:null,hasSwiped:!1,userId:null},window_:null,initialize:function(e,t){t=t||{},this.window_=t.win||window,this.on("change",function(){this.save()},this)},sync:function(e){var t;if(e==="update"||e==="create")t=JSON.stringify(this.toJSON()),this.window_.localStorage.CurrentUser=t;else if(e==="read"){t=this.window_.localStorage.CurrentUser||"{}";var n=JSON.parse(t);this.set(this.parse(n))}else e==="delete"&&this.window_.localStorage.removeItem("CurrentUser")},parse:function(e){return e.userId||(e.userId=window.NB.Utilities.UUID()),e.favourites||(e.favourites=[]),e},toggleFavourite:function(e){var t=_.clone(this.get("favourites")),n=_.pluck(t,"id"),r=n.indexOf(+e);if(r!==-1)t.splice(r,1),mixpanel.track("unfavourited",{stop:e});else{var i=window.app.getModel(),s=i.get("activeModel");if(!s.jsonifyForFavourites||!s.loaded)return!1;t.push(s.jsonifyForFavourites()),mixpanel.track("favourited",{stop:e})}return this.set("favourites",t)},isFavourite:function(e){var t=_.pluck(this.get("favourites"),"id");return t.indexOf(+e)!==-1}}),function(){this.JST||(this.JST={}),this.JST["Templates/cardview"]=function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments)};with(obj||{})__p.push('<div class="all-cards"></div>\n\n<div class="fakeCard">\n    <div class="title">\n        <h2>&nbsp;</h2>\n        <div class="clear clearfix"></div>\n    </div>\n\n    <ul class="timez">\n        <li>\n            <span class="time">&nbsp;</span>\n            <span class="name">&nbsp;</span>\n            <div class="clear"></div>\n        </li>\n        <li>\n            <span class="time">&nbsp;</span>\n            <span class="name">&nbsp;</span>\n            <div class="clear"></div>\n        </li>\n        <li>\n            <span class="time">&nbsp;</span>\n            <span class="name">&nbsp;</span>\n            <div class="clear"></div>\n        </li>\n        <li>\n            <span class="time">&nbsp;</span>\n            <span class="name">&nbsp;</span>\n            <div class="clear"></div>\n        </li>\n        <li>\n            <span class="time">&nbsp;</span>\n            <span class="name">&nbsp;</span>\n            <div class="clear"></div>\n        </li>\n    </ul>\n</div>\n\n<ul class="dots">\n    <li class="active"></li>',(new Array(numSlides_)).join("<li></li>"),"\n</ul>\n\n"),showSwipeHint_&&__p.push('\n<div class="swipe-hint">\n    <img src="/static/img/swipe-left.png"/>\n    <span>Swipe</span>\n</div>\n'),__p.push("\n");return __p.join("")}}.call(this),function(){this.JST||(this.JST={}),this.JST["Templates/emptyfavouritesview"]=function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments)};with(obj||{})__p.push('<li class="empty">\n    <div class="left">\n        <h3>No favourited stops.</h3>\n        <h4>Click on the star when you\'re viewing a stop to favourite it.</h4>\n    </div>\n    <div class="bubble">\n        <div class="inner"></div>\n        <img src="/static/img/favourites-hint.png" />\n    </div>\n</li>\n');return __p.join("")}}.call(this),function(){this.JST||(this.JST={}),this.JST["Templates/favouriteslistitemview"]=function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments)};with(obj||{})__p.push('<li data-stop-code="',id,'">\n    <h3>#',id," - ",name,'</h3>\n\n    <div class="numbers">\n        '),_.each(routes,function(e){__p.push('\n            <span class="number route-',window.NB.Utilities.padRouteNumber(e),'">\n                ',window.NB.Utilities.padRouteNumber(e),"\n            </span>\n        ")}),__p.push('\n\n        <div style="clear: both"></div>\n    </div>\n\n    <img src="/static/img/next.png" class="arrow"/>\n</li>\n');return __p.join("")}}.call(this),function(){this.JST||(this.JST={}),this.JST["Templates/favouriteslistview"]=function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments)};with(obj||{})__p.push('<h2 class="favourites-title">\n    Favourites\n\n    <div class="actions">\n        <div class="prev disabled">\n            <img src="/static/img/next.png" />\n        </div>\n        <div class="next ',pages<=1?"disabled":"",'">\n            <img src="/static/img/next.png" />\n        </div>\n\n        <div style="clear: both"></div>\n    </div>\n</h2>\n\n<ul class="favourites-list"></ul>\n');return __p.join("")}}.call(this),function(){this.JST||(this.JST={}),this.JST["Templates/headerview"]=function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments)};with(obj||{})__p.push('<div class="favourites"></div>\n\n<div class="persistent">\n    <div class="back btn">\n        <img src="/static/img/left.png"/>\n    </div>\n\n    <h1>nextbus</h1>\n\n    <div class="expand btn">\n        <img src="/static/img/expand.png"/>\n    </div>\n\n    <div class="favourite btn">\n        <img src="/static/img/unstarred.png"/>\n    </div>\n</div>\n');return __p.join("")}}.call(this),function(){this.JST||(this.JST={}),this.JST["Templates/indexview"]=function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments)};with(obj||{})__p.push('<h1>find the next bus</h1>\n\n<form>\n    <div class="input-holder">\n        <input type="text" placeholder="Stop number or name" class="user_input"/>\n    </div>\n</form>\n\n<div class="divider">\n    <div class="or">\n        <div class="left"></div>\n        <span>OR</span>\n        <div class="right"></div>\n    </div>\n</div>\n\n<div class="find-location">\n    <button>\n        <img src="/static/img/gps.png"/>\n        Use Current Location\n    </button>\n</div>\n\n<div class="footer">\n    <span class="copyright">&copy;&nbsp;2012&nbsp;Gavin Schulz</span>\n\n    <a href="/about" class="link" target="_blank">About</a>\n    <a href="/help" class="link" target="_blank">Help</a>\n</div>\n');return __p.join("")}}.call(this),function(){this.JST||(this.JST={}),this.JST["Templates/loader"]=function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments)};with(obj||{})__p.push('<div class="loader">\n    <span></span>\n    <span></span>\n    <span></span>\n    <span></span>\n    <span></span>\n</div>\n');return __p.join("")}}.call(this),function(){this.JST||(this.JST={}),this.JST["Templates/routecardview"]=function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments)};with(obj||{})__p.push('<div class="title">\n    <span class="number route-',window.NB.Utilities.padRouteNumber(get("number")),'">',window.NB.Utilities.padRouteNumber(get("number")),"</span>\n\n    <h2>",get("name"),'</h2>\n    <div class="clear clearfix"></div>\n</div>\n\n<ul class="timez">\n    '),_.each(get("times"),function(e){__p.push('\n        <li>\n            <span class="time" data-arrival-time="',e.arrival,'">\n                ',timeUntilToString(e.arrival),'\n            </span>\n            <span class="name">\n                ',stripEndpoint(e.endpoint),'\n            </span>\n\n            <div class="clear"></div>\n        </li>\n    ')}),__p.push("\n</ul>\n");return __p.join("")}}.call(this),function(){this.JST||(this.JST={}),this.JST["Templates/searchview"]=function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments)};with(obj||{})__p.push(""),_.each(get("results"),function(e){__p.push('\n    <div class="result" data-stop-code="',e.stop_code,'">\n        <div class="fake box"></div>\n\n        <div class="box">\n            <span class="name">\n                #',e.stop_code," - ",e.stop_name,'\n            </span>\n\n            <div class="numbers">\n                '),_.each(e.routes,function(e){__p.push('\n                    <span class="number route-',window.NB.Utilities.padRouteNumber(e),'">\n                        ',window.NB.Utilities.padRouteNumber(e),"\n                    </span>\n                ")}),__p.push('\n\n                <div style="clear: both"></div>\n            </div>\n\n            <img src="/static/img/next.png" class="img-next"/>\n        </div>\n    </div>\n')}),__p.push("\n\n"),!get("results")||get("results").length==0?__p.push('\n    <h3 class="no-results">\n        No results found for <span class="query">',queryString(),".</span>\n    </h3>\n"):__p.push('\n    <div class="end-mark"></div>\n'),__p.push("\n");return __p.join("")}}.call(this),function(){this.JST||(this.JST={}),this.JST["Templates/servererror"]=function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments)};with(obj||{})__p.push('<h3 class="error">A server error has occurred and we\'re looking into it.</h3>\n');return __p.join("")}}.call(this),function(){this.JST||(this.JST={}),this.JST["Templates/stopview"]=function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments)};with(obj||{})__p.push('<h2 class="stop-title">#',get("id"),": ",get("name"),'</h2>\n\n<div class="card"></div>\n');return __p.join("")}}.call(this),window.NB.Utilities={UUID:function(e,t){for(t=e="";e++<36;t+=e*51&52?(e^15?8^Math.random()*(e^20?16:4):4).toString(16):"-");return t},padRouteNumber:function(e){var t="0"+e;return t.slice(-2)}},window.NB.ApplicationView=Backbone.View.extend({el:".application",model:null,headerView_:null,contentView_:null,render:function(){this.headerView_=new window.NB.HeaderView({model:this.model}),this.$el.append(this.headerView_.render().el)},showIndex:function(){var e=new window.NB.IndexView;this.setContent_(e,{activeCard:"index",activeModel:null,stopId:null})},showStopCard:function(e){var t=new window.NB.StopModel({id:e}),n=new window.NB.StopView({model:t});this.setContent_(n,{activeCard:"stop",activeModel:t,stopId:e})},showSearchCard:function(e){var t=new window.NB.SearchModel({query:e}),n=new window.NB.SearchView({model:t});this.setContent_(n,{activeCard:"search",activeModel:t,stopId:null})},setContent_:function(e,t){t=t||{},this.contentView_&&this.contentView_.remove(),this.contentView_=e,this.$(".application-content").append(this.contentView_.render().el),this.model.set(t)}}),window.NB.CardView=Backbone.View.extend({className:"cardHolder",events:{"swipeLeft .timez":"swipeLeftEvt_","swipeRight .timez":"swipeRightEvt_","swipeLeft .title":"swipeLeftEvt_","swipeRight .title":"swipeRightEvt_"},model:null,activeSlide_:1,numSlides_:null,routeCardViews_:null,showSwipeHint_:!1,currentUser_:null,initialize:function(){this.routeCardViews_=[],this.currentUser_=window.app.getUser();var e=this.model.get("routes");this.numSlides_=e.length},render:function(){this.checkFirstTimeUse_(),this.el.innerHTML=window.JST["Templates/cardview"](this);var e=this.model.get("routes");return _.each(e,function(e,t){var n=new window.NB.RouteCardView({model:e,index:t});this.routeCardViews_.push(n),this.$(".all-cards").append(n.render().el)},this),this},remove:function(){_.each(this.routeCardViews_,function(e){e.remove()}),Backbone.View.prototype.remove.apply(this,arguments)},updateSlideClasses_:function(e){var t=this.$(".card.current"),n=this.$(".card:nth-child("+this.activeSlide_+")");t.addClass(e.current),t.removeClass("current"),n.addClass("current"),n.removeClass(e.next),this.updateDots_(),this.currentUser_.get("hasSwiped")||(this.currentUser_.set("hasSwiped",!0),this.$(".swipe-hint").hide()),mixpanel.track("swipe")},swipeLeftEvt_:function(e){if(this.activeSlide_===this.numSlides_)return;this.activeSlide_++,this.updateSlideClasses_({current:"left",next:"right"})},swipeRightEvt_:function(e){if(this.activeSlide_===1)return;this.activeSlide_--,this.updateSlideClasses_({current:"right",next:"left"})},updateDots_:function(){var e="nth-child("+this.activeSlide_+")";$(".dots .active").removeClass("active"),$(".dots li:"+e).addClass("active")},checkFirstTimeUse_:function(){!this.currentUser_.get("hasSwiped")&&this.numSlides_>1&&(this.showSwipeHint_=!0)}}),window.NB.FavouriteStarView=Backbone.View.extend({model:null,appModel_:null,events:{click:"toggleFavouriteEvt_"},initialize:function(){this.appModel_=window.app.getModel(),this.appModel_.on("change:stopId",this.updateStar_,this),this.model.on("change:favourites",this.updateStar_,this)},remove:function(){this.appModel_.off("change:stopId",this.updateStar_,this),this.model.off("change:favourites",this.updateStar_,this),Backbone.View.prototype.remove.apply(this,arguments)},toggleFavouriteEvt_:function(){var e=this.appModel_.get("stopId"),t=this.model.toggleFavourite(e);t||alert("Could not favourite stop please try again.")},updateStar_:function(){val=this.appModel_.get("stopId");var e=this.el.querySelector("img");src=this.model.isFavourite(val)?"starred":"unstarred",e.setAttribute("src","/static/img/"+src+".png")}}),window.NB.FavouritesListView=Backbone.View.extend({model:null,events:{"click li":"navigateToStop_","click .prev":"showPreviousPage_","click .next":"showNextPage_"},currentPage_:0,pageSize_:2,numPages_:0,initialize:function(){this.model.on("change reset",this.render,this)},render:function(){var e=(this.model.get("favourites")||[]).length;return this.numPages_=Math.ceil(e/this.pageSize_),this.currentPage_=0,this.el.innerHTML=window.JST["Templates/favouriteslistview"]({pages:this.numPages_}),this.renderFavouritesPage_(),this},remove:function(){this.model.off("change reset",this.render,this),Backbone.View.prototype.remove.apply(this,arguments)},renderFavouritesPage_:function(){var e=this.favouritesForPage_(this.currentPage_),t=this.$(".favourites-list").empty();if(e.length===0&&this.currentPage_===0){var n=window.JST["Templates/emptyfavouritesview"]();t.append(n);return}_.each(e,function(e){var n=window.JST["Templates/favouriteslistitemview"](e);t.append(n)})},favouritesForPage_:function(e){var t=this.model.get("favourites"),n=e*this.pageSize_;return t?t.slice(n,n+this.pageSize_):[]},navigateToStop_:function(e){var t=e.currentTarget.getAttribute("data-stop-code");this.trigger("stopSelected"),app.getRouter().navigate("stop/"+t,{trigger:!0}),mixpanel.track("clickFavourite",{code:t})},showPreviousPage_:function(e){this.currentPage_--,this.updateFavourites()},showNextPage_:function(e){this.currentPage_++,this.updateFavourites()},updateFavourites:function(){this.$(".prev").toggleClass("disabled",this.currentPage_===0),this.$(".next").toggleClass("disabled",this.currentPage_===this.numPages_-1),this.renderFavouritesPage_(),mixpanel.track("navigateFavourites")}}),window.NB.HeaderView=Backbone.View.extend({tagName:"header",model:null,favouriteStarView_:null,favouritesListView_:null,events:{"click .expand":"expandHeaderEvt_","click .back":"backButtonEvt_"},initialize:function(){this.model.on("change:activeCard",this.activeCardChange_,this)},render:function(){this.el.innerHTML=window.JST["Templates/headerview"]();var e=window.app.getUser();return this.favouriteStarView_&&this.favouriteStarView_.remove(),this.favouriteStarView_=new window.NB.FavouriteStarView({el:this.$(".favourite"),model:e}),this.favouritesListView_&&this.favouritesListView_.remove(),this.favouritesListView_=new window.NB.FavouritesListView({model:e}),this.favouritesListView_.on("stopSelected",this.expandHeaderEvt_,this),this.$(".favourites").html(this.favouritesListView_.render().el),this},remove:function(){this.model.off("change:activeCard",this.activeCardChange_,this),this.favouriteStarView_&&this.favouriteStarView_.remove(),this.favouritesListView_&&(this.favouritesListView_.off("stopSelected",this.expandHeaderEvt_,this),this.favouritesListView_&&this.favouritesListView_.remove()),Backbone.View.prototype.remove.apply(this,arguments)},activeCardChange_:function(){var e;e=this.model.get("activeCard")==="stop"?"add":"remove",this.el.classList[e]("has-favourite-button"),e=this.model.get("activeCard")==="index"?"remove":"add",this.el.classList[e]("has-back-button")},expandHeaderEvt_:function(){this.el.classList.toggle("open"),mixpanel.track("openHeader")},backButtonEvt_:function(){window.history.back()}}),window.NB.IndexView=Backbone.View.extend({className:"index",events:{"submit form":"formSubmitEvt_","click button":"currentLocationEvt_"},initialize:function(){this.geoSuccessEvt_=this.geoSuccessEvt_.bind(this),this.geoErrorEvt_=this.geoErrorEvt_.bind(this)},render:function(){return this.el.innerHTML=window.JST["Templates/indexview"](),this},currentLocationEvt_:function(){this.el.classList.add("locating"),navigator.geolocation.getCurrentPosition(this.geoSuccessEvt_,this.geoErrorEvt_)},formSubmitEvt_:function(e){e.preventDefault();var t=this.$(".user_input").val(),n=t.match(/^[0-9]{4}$/)?"stop":"search";return app.getRouter().navigate(n+"/"+encodeURIComponent(t),{trigger:!0}),mixpanel.track("formSubmit",{action:n,query:t}),!1},geoSuccessEvt_:function(e){this.el.classList.remove("locating");var t=[e.coords.latitude,e.coords.longitude].join("|");app.getRouter().navigate("search/"+encodeURIComponent(t),{trigger:!0}),mixpanel.track("geoSuccess")},geoErrorEvt_:function(e){this.el.classList.remove("locating");if(e.code==1)alert("Permission denied: Could not acquire current location.");else if(e.code==2){var t="Could not determine current location.  Ensure location services are enabled.";alert(t)}mixpanel.track("geoError",{code:e.code,message:e.message})}}),window.NB.RouteCardView=Backbone.View.extend({className:"card",model:null,updateTimeout_:null,initialize:function(e){e&&(this.index_=e.index||0),this.updateTimes_=_.bind(this.updateTimes_,this)},render:function(){var e=this.index_===0?"current":"right";return this.el.classList.add(e),this.updateTimeout_||(this.updateTimeout_=window.setInterval(this.updateTimes_,2e4)),this.el.innerHTML=window.JST["Templates/routecardview"](this.model),this},remove:function(){this.updateTimeout_&&window.clearInterval(this.updateTimeout_),Backbone.View.prototype.remove.apply(this,arguments)},updateTimes_:function(){var e=this.model;this.$(".time").each(function(t,n){var r=n.getAttribute("data-arrival-time"),i=e.timeUntilToString(r);$(n).html(i)})}}),window.NB.SearchView=Backbone.View.extend({className:"search",events:{"click .result":"clickResultEvt_"},model:null,initialize:function(){this.fetchError_=this.fetchError_.bind(this),this.model.on("reset change",this.render,this)},render:function(){return this.model.loaded?(this.el.innerHTML=window.JST["Templates/searchview"](this.model),this):(this.el.innerHTML=window.JST["Templates/loader"](),this.model.fetch({error:this.fetchError_}),this)},remove:function(){this.model.off("reset change",this.render,this),Backbone.View.prototype.remove.apply(this,arguments)},clickResultEvt_:function(e){var t=e.currentTarget.getAttribute("data-stop-code");app.getRouter().navigate("stop/"+t,{trigger:!0}),mixpanel.track("searchResultSelected",{code:t})},fetchError_:function(e,t,n){t.readyState===4&&(this.el.innerHTML=window.JST["Templates/servererror"](),mixpanel.track("searchServerError",{query:decodeURIComponent(e.get("query"))}))}}),window.NB.StopView=Backbone.View.extend({className:"stop",model:null,cardView_:null,initialize:function(){this.model.on("change reset",this.render,this)},render:function(){return this.model.loaded?(this.cardView_&&this.cardView_.remove(),this.el.innerHTML=window.JST["Templates/stopview"](this.model),this.cardView_=new window.NB.CardView({model:this.model}),this.$(".card").append(this.cardView_.render().el),this):(this.el.innerHTML=window.JST["Templates/loader"](),this.model.fetch(),this)},remove:function(){this.model.off("change reset",this.render,this),this.cardView_&&this.cardView_.remove(),Backbone.View.prototype.remove.apply(this,arguments)}});var Application=function(){this.model_=new window.NB.ApplicationModel,this.user_=new window.NB.UserModel,this.view_=new window.NB.ApplicationView({model:this.model_}),this.router_=new window.NB.Router};_.extend(Application.prototype,Backbone.Events,{start:function(){this.view_.render(),this.user_.fetch(),this.user_.save();try{window.location.hash="",Backbone.history.start({root:"/app"})}catch(e){console.error(e)}mixpanel.register({uuid:this.user_.get("userId")}),mixpanel.track("AppLoad")},getModel:function(){return this.model_},getRouter:function(){return this.router_},getUser:function(){return this.user_},getView:function(){return this.view_}});