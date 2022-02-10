import '../styles/global.css'
import { wrapper } from '../redux/store'
import { useSelector, useDispatch } from 'react-redux'
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { updatePageStaticProps } from '../redux/actions';

export function App({ Component, pageProps }) {
  // console.log("_app", Component.name, pageProps)
  //TODO: use global layout here
  let router = useRouter();
  let dispatch = useDispatch();
  const pageStaticProps = useSelector(state => state.reducer.pageStaticProps[router.asPath])
  useEffect(() => {
    if (router.query.persistProps && Component.cmsConfig) {
      dispatch(updatePageStaticProps(Component.cmsConfig.url, pageProps))
    }
  })
  return (<Component {...pageProps} />)
}

export default wrapper.withRedux(App)