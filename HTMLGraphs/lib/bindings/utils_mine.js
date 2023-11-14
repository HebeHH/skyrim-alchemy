function findPathsBetweenNodes(node_a, node_b, curr_edges = false, max_path_length = 5) {
  if (!curr_edges) { curr_edges = edges.get({ returnType: "object" }); }
  
  workable_paths = []

  function check_next_step(path, curr_node, prev_node) {
      if (path.length > max_path_length) { return; }
      if (curr_node == node_b) {
          workable_paths = workable_paths.concat([path]);
          return;
      }
      next_edges = curr_edges.filter(
          e => curr_node.startsWith('Ing') ? e.to == curr_node : e.from == curr_node 
          ).filter(e => curr_node.startsWith('Ing') ? e.from != prev_node : e.to != prev_node)
      next_edges.forEach(e => {
          check_next_step(
              path.concat([e]), 
              curr_node.startsWith('Ing') ? e.from  : e.to,
              curr_node
          )
      });        
  }

  check_next_step([], node_a, '')
  return workable_paths

}

function highlightPathBetweenNodes(node_a, node_b) {
  highlightActive = true;

  // get current graph
  curr_nodes = nodes.get({ returnType: "object" });
  curr_edges = edges.get({ returnType: "object" });

  paths = findPathsBetweenNodes(node_a, node_b, curr_edges)
  console.log(paths)
  highlight_paths = [...new Set(paths.flat())]
  highlight_edges = highlight_paths.map(he => he.id)
  highlight_nodes = [...new Set(highlight_paths.map(e => [e.from, e.to]).flat())]

  // for (let nodeId in curr_nodes) {
  //   curr_nodes[nodeId].color = "rgba(120,180,180,0.3)";
  // }

  // Change node colors: ones in a path bright, all others hard to see
  curr_edges.forEach(e =>  e.color = ( highlight_edges.includes(e.id) ? 'cyan' : "rgba(120,180,180,0.3)"))
  edges.update(curr_edges)
  
  // Change edge colors: ones in a path bright, all others hard to see
  curr_nodes.forEach(n =>  n.color = ( highlight_nodes.includes(n.id) ? nodeColors[n.id] : "rgba(120,180,180,0.3)"))
  nodes.update(curr_nodes)
  
}


function neighbourhoodHighlight(params, degrees = 5) {
  allNodes = nodes.get({ returnType: "Object" });
  console.log("in neighborhood highlight, highlight active: ", highlightActive, ", degrees: ", degrees)
  // if something is selected:
  if (params.nodes.length > 0) {
    highlightActive = true;
    var i, j;
    var selectedNode = params.nodes[0];
    // mark all nodes as hard to read.

    for (let nodeId in allNodes) {
      allNodes[nodeId].color = "rgba(120,180,180,0.3)";
    }

    // reset all edges to inherit color
    curr_edges = edges.get({ returnType: "object" });
    curr_edges.forEach(e => e.color = {inherit: true})
    edges.update(curr_edges)



    // set the color madding for nodes and edges at each degree
    default_color_neighbourHighlight = {
      nodeColor: nodeId => ({
        background: nodeColors[nodeId].background  + "66",
        border: "#6c757ddd",
      }),
      edgeColor: {inherit: true}
    }
    color_mapping_neighbourHighlight = [
      {
        nodeColor: nodeId => nodeColors[nodeId],
        edgeColor: {highlight: 'cyan'}
      },
      {
        nodeColor: nodeId => nodeColors[nodeId],
        edgeColor: {color: 'green'}
      },
      {
        nodeColor: nodeId => ({
          background: nodeColors[nodeId].background  + "dd",
          border: nodeColors[nodeId].border  + "dd",
        }),
        edgeColor: {color: 'yellow'}
      },
      {
        nodeColor: nodeId => ({
          background: nodeColors[nodeId].background  + "aa",
          border: "#bb8800aa",
        }),
        edgeColor: {color: 'orange'}
      },
      {
        nodeColor: nodeId => ({
          background: nodeColors[nodeId].background  + "aa",
          border: "#bb8800aa",
        }),
        edgeColor: {color: 'maroon'}
      },
      {
        nodeColor: nodeId => ({
          background: nodeColors[nodeId].background  + "88",
          border: "#6c757ddd",
        }),
        edgeColor: {inherit: true}
      },
    ]
    function getColorAtDegree(degree) {
      return degree < color_mapping_neighbourHighlight.length ? color_mapping_neighbourHighlight[degree] : default_color_neighbourHighlight;
    }


    
    var allConnectedNodes = [selectedNode] // keeps track of whether node already in a higher degree
    var connectedNodesByDegrees = [[selectedNode]]
    var allConnectedEdges = [] // keeps track of whether node already in a higher degree
    var edges_to_update = []

    // Get all connected nodes for each degree, without duplicates
    for (i = 0; i < degrees + 1; i++) {

      // Set color for nodes at degree
      connectedNodesByDegrees[i].forEach(nodeId => {
        allNodes[nodeId].color = getColorAtDegree(i).nodeColor(nodeId);
      })
      // get all connected edges at this degree
      connectedEdgesAtDegree = connectedNodesByDegrees[i].map(nid => network.getConnectedEdges(nid));
      // flatten and remove duplicates
      connectedEdgesAtDegree = [...new Set(connectedEdgesAtDegree.flat())].filter(nid => !allConnectedEdges.includes(nid));
      allConnectedEdges = allConnectedEdges.concat(connectedEdgesAtDegree)
      // update color for edges at this degree
      edges_to_update = edges_to_update.concat(connectedEdgesAtDegree.map(e => ({id:e,color: getColorAtDegree(i).edgeColor})));
      
      // get new nodes to update if necessary
      if (i < degrees) {
        // get all connected nodes and edges at this degree
        connectedNodesAtDegree = connectedNodesByDegrees[i].map(nid => network.getConnectedNodes(nid));
        // flatten and remove duplicates
        connectedNodesAtDegree = [...new Set(connectedNodesAtDegree.flat())].filter(nid => !allConnectedNodes.includes(nid));
        // add to accumulators
        allConnectedNodes = allConnectedNodes.concat(connectedNodesAtDegree)
        connectedNodesByDegrees = connectedNodesByDegrees.concat([connectedNodesAtDegree])
      }
    }
    edges.update(edges_to_update)

    
  } 
  
  
  else if (highlightActive === true) {
    console.log("resetting nodes")
    // reset all nodes
    for (let nodeId in allNodes) {
      allNodes[nodeId].color = nodeColors[nodeId];
    }
    curr_edges = edges.get({ returnType: "object" });
    curr_edges.forEach(e => e.color = {inherit: true})
    edges.update(curr_edges)
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

    
    console.log(node_list)
    for (let index = 0; index < node_list.length; index++) {
      node_list[index].color = nodeColors[node_list[index].id];
    }
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
