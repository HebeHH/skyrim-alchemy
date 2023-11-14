 

function neighbourhoodHighlight(params, degrees = 2) {
  allNodes = nodes.get({ returnType: "Object" });
  console.log("in neighborhood highlight")
  console.log('highlight active', highlightActive)
  
  // if something is selected:
  if (params.nodes.length > 0) {
    highlightActive = true;
    var i, j;
    var selectedNode = params.nodes[0];
    // mark all nodes as hard to read.
    for (let nodeId in allNodes) {
      // nodeColors[nodeId] = allNodes[nodeId].color;
      allNodes[nodeId].color = "rgba(120,180,180,0.3)";
    }
    var connectedNodes = network.getConnectedNodes(selectedNode);
    
    // get nodes at N degrees
    var second_degree_nodes = [];
    // get the second degree nodes
      for (j = 0; j < connectedNodes.length; j++) {
        second_degree_nodes = second_degree_nodes.concat(
          network.getConnectedNodes(connectedNodes[j])
        );
      }
      var third_degree_nodes = [];
    // get the third degree nodes
      for (j = 0; j < second_degree_nodes.length; j++) {
        third_degree_nodes = third_degree_nodes.concat(
          network.getConnectedNodes(second_degree_nodes[j])
        );
      }
      var fourth_degree_nodes = [];
    // get the third degree nodes
      for (j = 0; j < third_degree_nodes.length; j++) {
        fourth_degree_nodes = fourth_degree_nodes.concat(
          network.getConnectedNodes(third_degree_nodes[j])
        );
      }



    
    // all fourth degree nodes get a different color and their label back
    for (i = 0; i < fourth_degree_nodes.length; i++) {
      new_color = {
        background: nodeColors[fourth_degree_nodes[i]].background  + "66",
        // border: nodeColors[fourth_degree_nodes[i]].border  + "66",
        border: "#bb880066",
      }
      allNodes[fourth_degree_nodes[i]].color = new_color;
    }
    // all third degree nodes get a different color and their label back
    for (i = 0; i < third_degree_nodes.length; i++) {
      new_color = {
        background: nodeColors[third_degree_nodes[i]].background  + "aa",
        // border: nodeColors[third_degree_nodes[i]].border  + "aa",
        border: "#bb0066aa",
      }
      allNodes[third_degree_nodes[i]].color = new_color;
    }
    // all second degree nodes get a different color and their label back
    for (i = 0; i < second_degree_nodes.length; i++) {
      new_color = {
        background: nodeColors[second_degree_nodes[i]].background  + "dd",
        border: nodeColors[second_degree_nodes[i]].border  + "dd",
      }
      allNodes[second_degree_nodes[i]].color = new_color;
    }
    // all first degree nodes get their own color and their label back
    for (i = 0; i < connectedNodes.length; i++) {
      // allNodes[connectedNodes[i]].color = undefined;
      console.log(nodeColors[connectedNodes[i]])
      allNodes[connectedNodes[i]].color = nodeColors[connectedNodes[i]];
    }

    // the main node gets its own color and its label back.
    // allNodes[selectedNode].color = undefined;
    allNodes[selectedNode].color = nodeColors[selectedNode];
  } else if (highlightActive === true) {
    console.log("resetting nodes")
    // reset all nodes
    for (let nodeId in allNodes) {
      allNodes[nodeId].color = nodeColors[nodeId];
    }
    highlightActive = false;
  }

  // transform the object into an array
  var updateArray = [];
  if (params.nodes.length > 0) {
    for (let nodeId in allNodes) {
      if (allNodes.hasOwnProperty(nodeId)) {
        updateArray.push(allNodes[nodeId]);
      }
    }
    nodes.update(updateArray);
  } else {
    for (let nodeId in allNodes) {
      if (allNodes.hasOwnProperty(nodeId)) {
        updateArray.push(allNodes[nodeId]);
      }
    }
    nodes.update(updateArray);
  }
}

function filterHighlight(params) {
  allNodes = nodes.get({ returnType: "Object" });
  // if something is selected:
  if (params.nodes.length > 0) {
    filterActive = true;
    let selectedNodes = params.nodes;

    // hiding all nodes and saving the label
    for (let nodeId in allNodes) {
      allNodes[nodeId].hidden = true;
      if (allNodes[nodeId].savedLabel === undefined) {
        allNodes[nodeId].savedLabel = allNodes[nodeId].label;
        allNodes[nodeId].label = undefined;
      }
    }

    for (let i = 0; i < selectedNodes.length; i++) {
      allNodes[selectedNodes[i]].hidden = false;
      if (allNodes[selectedNodes[i]].savedLabel !== undefined) {
        allNodes[selectedNodes[i]].label =
          allNodes[selectedNodes[i]].savedLabel;
        allNodes[selectedNodes[i]].savedLabel = undefined;
      }
    }
  } else if (filterActive === true) {
    // reset all nodes
    for (let nodeId in allNodes) {
      allNodes[nodeId].hidden = false;
      if (allNodes[nodeId].savedLabel !== undefined) {
        allNodes[nodeId].label = allNodes[nodeId].savedLabel;
        allNodes[nodeId].savedLabel = undefined;
      }
    }
    filterActive = false;
  }

  // transform the object into an array
  var updateArray = [];
  if (params.nodes.length > 0) {
    for (let nodeId in allNodes) {
      if (allNodes.hasOwnProperty(nodeId)) {
        updateArray.push(allNodes[nodeId]);
      }
    }
    nodes.update(updateArray);
  } else {
    for (let nodeId in allNodes) {
      if (allNodes.hasOwnProperty(nodeId)) {
        updateArray.push(allNodes[nodeId]);
      }
    }
    nodes.update(updateArray);
  }
}

function selectNode(nodes) {
  network.selectNodes(nodes);
  neighbourhoodHighlight({ nodes: nodes });
  return nodes;
}

function selectNodes(nodes) {
  network.selectNodes(nodes);
  filterHighlight({ nodes: nodes });
  return nodes;
}

function highlightFilter(filter) {
  let selectedNodes = [];
  let selectedProp = filter["property"];
  if (filter["item"] === "node") {
    let allNodes = nodes.get({ returnType: "Object" });
    for (let nodeId in allNodes) {
      if (
        allNodes[nodeId][selectedProp] &&
        filter["value"].includes(allNodes[nodeId][selectedProp].toString())
      ) {
        selectedNodes.push(nodeId);
      }
    }
  } else if (filter["item"] === "edge") {
    let allEdges = edges.get({ returnType: "object" });
    // check if the selected property exists for selected edge and select the nodes connected to the edge
    for (let edge in allEdges) {
      if (
        allEdges[edge][selectedProp] &&
        filter["value"].includes(allEdges[edge][selectedProp].toString())
      ) {
        selectedNodes.push(allEdges[edge]["from"]);
        selectedNodes.push(allEdges[edge]["to"]);
      }
    }
  }
  selectNodes(selectedNodes);
}
