import React from 'react'
import MenuItem from './MenuItem'

const Menu = ({menuItems, menuTitle, parentMenuTitle, submenus, layers, onLayerClick, onMenuItemClick, onMouseOver, sidebarLeftWidth, sidebarLeftHeight, onMouseOut, onUntoggleAllClick, selected, currentLevel, allMenuItems, idMenu}) => {

    if(!allMenuItems){
        allMenuItems = menuItems
    }

    // add a selected class to the menu if it is selected
    let menuClassName = "menu menu-container" + (selected ? ' selected' : '')

    // check if there are items hidden by search
    let itemsNotMatched = false
    if(menuItems){
        for (let menuItem of menuItems) {
            if (menuItem.title && menuItem.match === false) {
                itemsNotMatched = true
            }
        }
    }

    // check if this menu has submenu children selected
    allMenuItems.forEach(oneMenuItem => {
        // first find this menu
        if (oneMenuItem.idMenu === idMenu) {
            // if it is selected
            if (oneMenuItem.selected) {
                // check if any of this menu's submenu is selected
                oneMenuItem.submenus.forEach(submenu => {
                    allMenuItems.forEach(thisMenuItem => {
                        if(thisMenuItem.idMenu === submenu && thisMenuItem.selected){
                            // if it is selected, add class to father's menu
                            menuClassName += ' has-submenu-opened'
                        }
                    })
                })
            }
        }
    })

    function menu(item) {
        if(item.isSubMenu){
            return null;
        }
        return (<MenuItem
                    item={item}
                    layers={layers}
                    onLayerClick={onLayerClick}
                    onMenuItemClick={onMenuItemClick}
                    onItemClick={Number.isInteger(item) ? onLayerClick : onMenuItemClick}
                    onMouseOver={onMouseOver}
                    sidebarLeftWidth={sidebarLeftWidth}
                    sidebarLeftHeight={sidebarLeftHeight}
                    onMouseOut={onMouseOut}
                    parentMenuTitle={menuTitle}
                    currentLevel={currentLevel}
                    allMenuItems={menuItems}
                    key={Number.isInteger(item) ? item : item.idMenu}
                />)
    }

    function subMenu(submenu) {
        let thisMenu;

        allMenuItems.forEach( (relativeItem) => {
            if (submenu === relativeItem.idMenu) {
                thisMenu = relativeItem
            }
        })

        return (<MenuItem
                    item={thisMenu}
                    layers={layers}
                    onLayerClick={onLayerClick}
                    onMenuItemClick={onMenuItemClick}
                    onItemClick={Number.isInteger(thisMenu) ? onLayerClick : onMenuItemClick}
                    onMouseOver={onMouseOver}
                    sidebarLeftWidth={sidebarLeftWidth}
                    sidebarLeftHeight={sidebarLeftHeight}
                    onMouseOut={onMouseOut}
                    parentMenuTitle={menuTitle}
                    currentLevel={currentLevel}
                    allMenuItems={allMenuItems}
                    key={thisMenu.idMenu}
                />)
    }

    return (
        <ul className={menuClassName}>
            {
                (!menuTitle && currentLevel > 0 && !itemsNotMatched) ?
                    <li className="menu-item-all-layers" onClick={onUntoggleAllClick}>Todas as camadas</li>
                : ''
            }
            {
                (submenus && submenus.length > 0) ?
                    submenus.map(
                        (submenu) => subMenu(submenu)
                    )
                : ''
            }
            {
                menuItems ? menuItems.map(
                    (item) => menu(item)
                ) : ''
            }
        </ul>
    )
}

export default Menu
