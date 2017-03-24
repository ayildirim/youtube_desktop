import React from 'react';
import YT_API_KEY from '../../../config/api_key';

class Comments extends React.Component {

  constructor(props) {
    super(props)

    this.state = { comments: [] }
  }

  componentDidMount() {
    this._fetchComments();
  }

  _fetchComments() {
    return fetch(`https://www.googleapis.com/youtube/v3/commentThreads?part=snippet,replies&videoId=${this.props.videoId}&key=${YT_API_KEY.publicDataKey}`)
      .then(response => response.json())
      .then(responseJson => {
        this.setState({ comments: responseJson.items });
      })
      .catch(error => {
        console.error(error);
      })
  }

  renderComments() {
    if (this.state.comments.length !== 0) {
      let comments = this.state.comments;
      return
    }
  }

  render() {
    return (
      <div className="comments-container">
        <div className="comments-list">

        </div>
      </div>
    );
  }
}

export default Comments;
