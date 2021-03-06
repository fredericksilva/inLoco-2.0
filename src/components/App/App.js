import React from 'react'
import ReactDOM from 'react-dom'
import logger from 'redux-logger'
import { applyMiddleware, createStore } from 'redux'
import appReducer from './appReducer.js'
import { Provider } from 'react-redux'
import LeafletMapContainer from '../LeafletMap/LeafletMapContainer.js'
import SidebarLeftContainer from '../SidebarLeft/SidebarLeftContainer.js'
import SidebarRightContainer from '../SidebarRight/SidebarRightContainer.js'
import HeaderContainer from '../Header/HeaderContainer.js'
import HeaderRightContainer from '../HeaderRight/HeaderRightContainer.js'
import ExampleHighcharts from '../Charts/ExampleHighcharts.js'
import GeoAPI from '../Api/GeoAPI.js'
import TooltipContainer from '../Tooltip/TooltipContainer.js'
import { populateApp } from '../../actions/actions.js'

require('./app.scss')

const store = createStore(appReducer, applyMiddleware(logger))

const ajaxCallback = (xmlData) => {
    store.dispatch(populateApp(xmlData))
};
GeoAPI.getContent(ajaxCallback)

const orderByLayerOrder = (layers) => {
    return layers.sort(function(a, b) {
        return a.order - b.order
    })
}

const App = () => {
    return (
         <Provider store={store}>
            <div className="module-app">
                <HeaderContainer/>
                <HeaderRightContainer/>
                <TooltipContainer/>
                <SidebarLeftContainer/>
                <SidebarRightContainer orderByLayerOrder={orderByLayerOrder}/>
                <LeafletMapContainer orderByLayerOrder={orderByLayerOrder}/>
            </div>
        </Provider>
    )
}

ReactDOM.render(
    <App/>, document.getElementById('app')
)
