import React, { useState, useEffect, useLayoutEffect } from 'react';
import Tree from '../components/Tree';
import SearchBoxWithDropdown from '../components/SearchBoxWithDropdown';
import { Icon, Label } from 'semantic-ui-react';

const VisualizationContainer = props => {
  let [fullTree, setFullTree] = useState(parse('root', props.treeData));
  let [newTree, setNewTree] = useState(null);
  let [searchKeyValue, setSearchKeyValue] = useState([]);
  let [input, setInput] = useState(null);
  let [filter, setFilter] = useState('key');
  let [isSearching, setIsSearching] = useState(false);

  const handleOnChange = event => {
    let eventValue = event;
    eventValue.target.localName === 'input'
      ? setInput(eventValue.target.value)
      : setFilter(eventValue.target.innerText);
  };

  const handleKeyPress = event => {
    let eventValue = event;
    let keyCode = eventValue.keyCode;
    if (keyCode === 13) handleOnClick();
    else setInput(eventValue.target.value);
  };

  const handleOnClick = () => {
    let textBox = document.querySelector('#inputTextBox');
    setInput(textBox.value);
    if (textBox.value) {
      // deep clone and update state
      let tempSearchKeyValue = searchKeyValue.slice();
      tempSearchKeyValue.push([filter, input]);
      setSearchKeyValue(tempSearchKeyValue);
      textBox.value = '';
      textBox.focus();
    }
    // else handleClearSearch();
  };

  useLayoutEffect(() => {
    // separating key searches
    if (searchKeyValue.length) {
      let inputKeys = searchKeyValue
        .filter(element => element[0] === 'key')
        .map(element => element[1])
        .join('|');
      // separating value searches
      let inputValues = searchKeyValue
        .filter(element => element[0] === 'value')
        .map(element => element[1])
        .join('|');
      setNewTree(markFound(fullTree, inputKeys, inputValues));
      setIsSearching(true);
      console.log(newTree);
    } else setIsSearching(false);
    // return handleClearSearch;
  }, [searchKeyValue.length, newTree, isSearching]);

  const handleRemoveKeyword = event => {
    let eventValue = event;
    let valueToRemove = eventValue.target.parentNode.innerText.split(' : ');
    for (let index = 0; index < searchKeyValue.length; index++) {
      if (
        valueToRemove[1] === searchKeyValue[index][1] &&
        valueToRemove[0] === searchKeyValue[index][0]
      ) {
        setSearchKeyValue(
          [].concat(
            searchKeyValue.slice(0, index),
            searchKeyValue.slice(index + 1, searchKeyValue.length),
          ),
        );
      }
    }
    handleClearSearch();
  };

  const handleClearSearch = () => {
    if (!searchKeyValue.length) setIsSearching(false);
  };

  // Tree structure from data
  function Data(name) {
    this.name = name;
    this.markedInSearch = false;
  }

  /**
   * Naive parser that returns an object fitted for D3 rendering
   *
   * expects an object (JSON parse beforehand if necessary)
   * @param {Object} input layout of the object to be parsed
   */

  function parse(name = 'App', input) {
    let result = new Data(name);
    result.children = new Array(0);
    for (let el of Object.entries(input)) {
      let newChild = new Data(el[0]);
      if (typeof el[1] === 'object') {
        newChild.children = new Array(0);
        newChild.children.push(parse(el[0], el[1]));
      } else {
        newChild.value = el[1];
      }
      result.children.push(newChild);
    }
    return result;
  }

  const markFound = (tree, inputKeys, inputValues) => {
    console.log(inputKeys, inputValues);
    if (inputKeys) {
      tree.markedInSearch = RegExp(`(${inputKeys})`, 'g').test(tree.name)
        ? true
        : false;
    }
    if (inputValues) {
      tree.markedInSearch = RegExp(`(${inputValues})`, 'g').test(tree.value)
        ? true
        : false;
    }
    console.log(
      inputKeys,
      tree.name,
      RegExp(`(${inputValues})`, 'g').test(tree.value),
      inputValues,
      tree.value,
      RegExp(`(${inputKeys})`, 'g').test(tree.name),
    );
    if (tree.children) {
      for (let index in tree.children) {
        markFound(tree.children[index], inputKeys, inputValues);
      }
    }
    return tree;
  };

  return (
    <div style={{ padding: '10px' }}>
      <SearchBoxWithDropdown
        handleOnChange={handleOnChange}
        handleOnClick={handleOnClick}
        handleKeyPress={handleKeyPress}
        searchWord={input}
      />
      {isSearching
        ? searchKeyValue.map(element => {
            let [filter, keyword] = element;
            return (
              <Label
                as="a"
                color="pink"
                key={'label-' + filter + '-' + keyword}
              >
                {filter + ' : ' + keyword}
                <Icon
                  name="delete"
                  onClick={handleRemoveKeyword}
                  key={'icon-' + filter + '-' + keyword}
                />
              </Label>
            );
          })
        : null}
      {isSearching ? (
        <Tree treeData={newTree} isSearching={isSearching} />
      ) : (
        <Tree treeData={fullTree} isSearching={isSearching} />
      )}
    </div>
  );
};

export default VisualizationContainer;
