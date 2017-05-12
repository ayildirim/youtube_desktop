/* global Promise */
import React from 'react';
import { values } from 'lodash';
import PropTypes from 'prop-types';
import { formatNumber, propChecker } from 'helpers';
import { SubscribeButton, VideoBox } from 'common/components';

import {
  ChannelNavbar,
  ChannelVideos
} from './subcomponents';

class Channel extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      channelId: this.props.params.channelId,
      currentRoute: "home",
      userId: this.props.user.channelId,
      subscribed: null
    };

    this.clickSubscribe = this.clickSubscribe.bind(this);
    this._getNewChannelInfo = this._getNewChannelInfo.bind(this);
  }

  componentDidMount() {
    this.props.receiveSetting({ isLoading: true });
    this._getNewChannelInfo(this.state.channelId, this.state.userId);
  }

  componentWillReceiveProps(newProps) {
    let channelId = newProps.params.channelId;
    let userId = newProps.user.channelId;
    if (this.state.channelId !== channelId) {
      this.setState({ channelId, userId });
      this._getNewChannelInfo(channelId, userId);
    }
  }

  _getNewChannelInfo(channelId, userId) {
    let dataNeeded = [];
    dataNeeded.push(this.props.fetchChannelDetails(channelId));
    dataNeeded.push(this.props.fetchChannelVideos(channelId));
    dataNeeded.push(this.props.fetchChannelPlaylists(channelId));

    if (this.props.loggedIn) {
      dataNeeded.push(this.isSubscribed());
      if (Object.keys(this.props.subscriptions).length === 0) {
        dataNeeded.push(this.props.fetchSubscriptions(userId));
      }
    }

    Promise.all(dataNeeded).then(() => {
      let playlists = this.props.playlists;
      let plDataNeeded = [];

      Object.keys(playlists).forEach(id => plDataNeeded.push(this.props.fetchPlaylistItems(id)));

      Promise.all(plDataNeeded).then(() => {
        this.props.receiveSetting({ isLoading: false });
      });
    });
  }

  isSubscribed() {
    let subscribed = Object.keys(this.props.subscriptions);
    let channelId = this.props.params.channelId;

    if (subscribed.includes(channelId)) {
      this.setState({ subscribed: true });
    } else {
      this.setState({ subscribed: false });
    }
  }

  clickSubscribe() {
    let channelId = this.state.channelId;
    let subscriptions = Object.keys(this.props.subscriptions);
    let subscriptionId;

    for (let i = 0; i < subscriptions.length; i++) {
      if (this.props.subscriptions[subscriptions[i]].resourceId.channelId === channelId) {
        subscriptionId = this.props.subscriptions[subscriptions[i]].subscriptionId;
      }
    }

    if (this.state.subscribed) {
      this.props.deleteSubscription(subscriptionId);
      this.setState({ subscribed: false });
    } else {
      this.props.insertSubscription(channelId);
      this.setState({ subscribed: true });
    }
  }

  renderPlaylists() {
    return values(this.props.playlists).map(playlist => (
      <VideoBox
        key={playlist.id}
        title={playlist.snippet.title}
        vids={playlist.items}
        maxNumber={playlist.items.length}
        windowWidth={this.props.setting.windowWidth}
        sidebarVisible={this.props.setting.sidebarVisible}
      />
    ));
  }

  render() {
    let bannerImg;
    let profileImg;
    let channelName;
    let subscriberNum;
    let videos;

    if (this.props.channelDetails.detail) {
      bannerImg = this.props.channelDetails.detail.brandingSettings.image.bannerImageUrl;
      profileImg = this.props.channelDetails.detail.snippet.thumbnails.default.url;
      channelName = this.props.channelDetails.detail.snippet.title;
      subscriberNum = parseInt(this.props.channelDetails.detail.statistics.subscriberCount, 10);
      videos = this.props.channelDetails.videos;
    }

    if (this.props.setting.isLoading) {
      return (
        <div />
      );
    } else {
      return (
        <div className="main-content">
          <div className="channels-container">
            <div className="channel-banner-container">
              <img id="channel-banner" src={bannerImg} />
            </div>

            <div className="channel-banner-header">
              <div className="channel-detail-container">
                <div className="channel-detail-left">
                  <div className="channel-profile-container">
                    <img id="channel-profile-img" src={profileImg} />
                  </div>

                  <div className="channel-detail">
                    <p id="channel-name">{channelName}</p>
                    <p id="channel-subscribers">{formatNumber(subscriberNum)} subscribers</p>
                  </div>
                </div>

                <SubscribeButton
                  clickSubscribe={this.clickSubscribe}
                  subscriberNum={subscriberNum}
                  isSubscribed={this.state.subscribed}
                />
              </div>
            </div>

            <ChannelNavbar currentRoute={this.state.currentRoute} />

            <ChannelVideos videos={videos} />

            { this.renderPlaylists() }

          </div>
        </div>
      );
    }
  }
}

Channel.propTypes = {
  fetchChannelDetails: PropTypes.func.isRequired,
  receiveSetting: PropTypes.func.isRequired,
  fetchSubscriptions: PropTypes.func.isRequired,
  fetchChannelVideos: PropTypes.func.isRequired,
  fetchChannelPlaylists: PropTypes.func.isRequired,
  fetchPlaylistItems: PropTypes.func.isRequired,
  insertSubscription: PropTypes.func.isRequired,
  deleteSubscription: PropTypes.func.isRequired,
  channelDetails: PropTypes.shape().isRequired,
  loggedIn: PropTypes.bool.isRequired,
  user: PropTypes.shape(),
  setting: propChecker.setting().isRequired,
  subscriptions: propChecker.subscriptions(),
  playlists: PropTypes.shape().isRequired,
  params: PropTypes.shape({
    channelId: PropTypes.string
  }).isRequired
};

Channel.defaultProps = {
  user: {},
  subscriptions: {}
};

export default Channel;
