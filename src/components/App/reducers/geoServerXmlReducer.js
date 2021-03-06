import { parseBoundingBox, parseStyle } from './geoServerXmlStyleReducer'

const RESTRICTED = false
const WORKSPACE = __WORKSPACE__
const ENDPOINT = __API__

/**
 * Parses XML response from GeoServer, creating a layers array
 * @param response response from GeoServer API (as XML)
 */
const geoServerXmlReducer = (response) => {
    let layers = []

    // adds iterators to XML nodes, so we can run forEach on them
    NodeList.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator]
    HTMLCollection.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator]

    // get root layers node, and parse layer data for each layer
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(response.data, 'text/xml')
    xmlDoc.firstElementChild.childNodes.forEach((rootChildrenNode) => {
        if (rootChildrenNode.nodeName === 'Capability') {
            rootChildrenNode.childNodes.forEach( (capabilityChildrenNode) => {
                if (capabilityChildrenNode.nodeName === 'Layer') {
                    capabilityChildrenNode.childNodes.forEach((rootLayerChildrenNode) => {
                        if (rootLayerChildrenNode.nodeName === 'Layer') {
                            layers = parseLayerNode(rootLayerChildrenNode, layers)
                        }
                    })
                }
            })
        }
    })

    return layers
}

/**
* Parses XML node for a single layer, populating GeoAPI.layers array.
* @param xmlNode XML node with a GeoServer layer
* @param layers layers array we're building
*/
const parseLayerNode = (xmlNode, layers) => {
    if(isValidLayer(xmlNode)) {
        let caops = []
        let menu = ''
        let menu2 = ''
        let name, title, abstract, table

        // gets name, title, abstract, and keywords for caops and menu
        xmlNode.childNodes.forEach((layerChildrenNode) => {
            switch (layerChildrenNode.nodeName) {
                case 'Name':
                    name = layerChildrenNode.textContent
                break
                case 'Title':
                    title = layerChildrenNode.textContent
                break
                case 'Abstract':
                    abstract = layerChildrenNode.textContent
                break
                case 'KeywordList':
                    layerChildrenNode.childNodes.forEach( (keywordNode) => {
                        if (keywordNode.nodeName === 'Keyword') {
                            let keywordsArray = keywordNode.textContent.split(':')

                            if (keywordsArray[0] === 'cao') {
                                caops.push(keywordsArray[1])
                            }
                            if (keywordsArray[0] === 'tabela') {
                                table = JSON.parse(keywordsArray[1])
                            }
                            if (keywordsArray[0] === 'menu') {
                                menu = keywordsArray[1]
                            }
                            if (keywordsArray[0] === 'menu2') {
                                var menu2Array = [
                                    keywordsArray[1]
                                ]
                                if (keywordsArray.length > 2) {
                                    // copy all submenus
                                    for (var i=2, l=keywordsArray.length; i<l; i++) {
                                        menu2Array.push(keywordsArray[i])
                                    }
                                }
                                menu2 = menu2Array
                            }
                        }
                    })
                break
            }
        })

        // create layer object
        var layer = {
            name,
            title,
            caops,
            menu,
            menu2,
            table,
            id:         `${WORKSPACE}_${name}`,
            workspace:   WORKSPACE,
            display:     true,
            restricted:  RESTRICTED,
            layerName:  `${WORKSPACE}:${name}`,
            description: abstract,
            bbox:        parseBoundingBox(xmlNode),
            key:         layers.length,
        }

        // get layer styles
        layer.styles = parseStyle(xmlNode, layer)

        // add to layers array
        layers.push(layer)
    }

    return layers
}

/**
* Check if the given XML node represents a valid layer.
* The layers we use must have a KeywordList node, with at least one element inside.
* @param xmlNode XML node with a GeoServer layer
* @returns {Boolean}
*/
const isValidLayer = (xmlNode) => {
    let ret = false

    xmlNode.childNodes.forEach((layerChildrenNode) => {
        if (layerChildrenNode.nodeName === 'KeywordList' && layerChildrenNode.children.length > 0) {
            if (ret === false) {
                ret = true
            }
        }
    })

    return ret
}

export default geoServerXmlReducer
