export const UPDATE_PAGE_STATIC_PROPS = 'UPDATE_PAGE_STATIC_PROPS'
export const SET_GITHUB_TOKEN = 'SET_GITHUB_TOKEN'
export const PUSH_NOTIFICATION = 'PUSH_NOTIFICATION'
export const DISMISS_NOTIFICATION = 'DISMISS_NOTIFICATION'

export const FETCHING_SOME_DATA = 'FETCHING_SOME_DATA'
export const ADD_SOME_DATA = 'ADD_SOME_DATA'

export const SESSION_GITHUB_TOKEN = 'SESSION_GITHUB_TOKEN'

export const updatePageStaticProps = (page, props) => {
  return {
    type: UPDATE_PAGE_STATIC_PROPS,
    page,
    props
  }
}

export const setGithubToken = token => {
  window.sessionStorage[SESSION_GITHUB_TOKEN] = token
  return {
    type: SET_GITHUB_TOKEN,
    token
  }
}

export const pushNotification = (content, className) => {
  return dispatch => {
    const id = new Date().getTime()
    dispatch({
      type: PUSH_NOTIFICATION,
      id,
      content,
      className
    })
    setTimeout(() => {
      dispatch({
        type: DISMISS_NOTIFICATION,
        id
      })
    }, 5000)
  }
}

export const fetchData = data => {
  return dispatch => {
    dispatch({
      type: FETCHING_SOME_DATA
    })

    return fetch('')
      .then(response => response.json())
      .then(response => {
        dispatch({
          type: ADD_SOME_DATA,
          payload: response
        })
      })
  }
}
