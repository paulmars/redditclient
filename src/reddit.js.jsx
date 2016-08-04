import $ from 'jquery'
import _ from 'underscore'

import React from 'react'
import ReactDOM from 'react-dom'

import { Router, Route, Link, browserHistory } from 'react-router'

var Story = React.createClass({
  render: function() {
    return (
      <div className="row" key={this.props.story.name}>
        <div className="col-xs-1">
          {this.props.story.score}
        </div>
        <div className="col-xs-11">
          <a href={this.props.story.url}>
            {this.props.story.title}
          </a>
          <br/>
          {this.props.story.author}
        </div>
      </div>
    );
  },
})

var StoryList = React.createClass({
  render: function() {
    var storyNodes = _.compact(_.map(this.props.stories, function(story) {
      try {
        return <Story key={story.data.id} story={story.data} />;
      }
      catch (e) {
        return null;
      }
    }));

    return (
      <div className="container">
        {storyNodes}
      </div>
    );
  },
});

var SubLinks = React.createClass({
  render: function() {
    return (
      <div>
        <h1>
          hello
        </h1>
        <div>
          <Link to="/">Frontpage</Link>
          <Link to="/r/aww">Awwww</Link>
        </div>
      </div>
    );
  },
});

window.onscroll = function(ev) {
  if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 500) {
    $('body').trigger('bottom');
  }
};

var loadLocation = function(location, callback) {
  console.log("loadLocation");
  console.log(location);

  $.ajax({
    url: location,
    dataType: "json",
    data: {
        format: "json"
    },
    success: function( response ) {
      callback(response.data.children);
    }
  });
};

var Subreddit = React.createClass({
  getDefaultProps: function() {
    return {
      location: window.location.pathname || ""
    };
  },
  getInitialState: function() {
    return ({
      stories: [],
    });
  },
  componentWillReceiveProps: function(nextProps) {
    this.newStories(this.props.location);
  },
  newStories: function(location) {
    console.log("newStories")
    var _this = this;
    var url = "https://www.reddit.com" + location + ".json";

    loadLocation(url, function(stories) {
      _this.setState({stories: stories});
    });
  },
  loadMore: function(location) {
    console.log("loadMore")
    var _this = this;
    var url = "https://www.reddit.com" + location + ".json";

    if (this.state.stories.length > 0) {
      var storyLength = this.state.stories.length;
      var lastStory = this.state.stories[storyLength - 1];
      var last_name = lastStory.data.name;
      var url = "https://www.reddit.com" + location + ".json?after=" + last_name;
    }

    loadLocation(url, function(stories) {
      var stories = _this.state.stories.concat(stories);
      _this.setState({ stories: stories });
    });
  },
  componentDidMount: function() {
    var _this = this;

    var throttledMore = _.throttle(function() {
      _this.loadMore(_this.props.location)
    }, 3000);
    $('body').on("bottom", throttledMore);
  },
  render: function() {
    return (
      <StoryList stories={this.state.stories} />
    );
  },
})

var App = React.createClass({
  render: function() {
    return (
      <div>
        <SubLinks />
        <Subreddit location={window.location.pathname} />
      </div>
    );
  }
});

var routeSet = (
  <Router history={browserHistory}>
    <Route path="/" component={App}>
      <Route path="/r/:subreddit" component={App} />
    </Route>
  </Router>
)

ReactDOM.render(routeSet, document.getElementById('app'))
browserHistory.push(window.location.pathname);
