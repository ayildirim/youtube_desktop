import * as YoutubeVideoAPI from '../util/youtube_video_util';

// Search Video Actions
export const RECEIVE_VIDEOS = 'RECEIVE_VIDEOS';
export const CLEAR_VIDEOS = 'CLEAR_VIDEOS';

export const receiveVideos = videos => ({
  type: RECEIVE_VIDEOS,
  videos
});

export const clearVideos = () => ({
  type: CLEAR_VIDEOS
});

export const searchVideos = (query, nextPageToken, pageNumber = 1) => dispatch => {
  console.log(pageNumber);
  console.log(nextPageToken);
  return YoutubeVideoAPI.fetchVideos(query, nextPageToken).then(
    res => res.json()
  ).then(
    videos => {
      videos['query'] = query;
      videos['pageNumber'] = pageNumber;
      return dispatch(receiveVideos(videos))
    }
  ).catch(
    err => console.log(err)
  );
};

// Trending Actions
export const RECEIVE_TRENDING = 'RECEIVE_TRENDING';

export const receiveTrending = videos => ({
  type: RECEIVE_TRENDING,
  videos
});

export const fetchTrending = () => dispatch => {
  return YoutubeVideoAPI.fetchTrending().then(
    res => res.json()
  ).then(
    videos => dispatch(receiveTrending(videos.items))
  ).catch(
    err => console.log(err)
  );
};
