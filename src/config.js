// MaximumDepth: 
// The maximum number of levels in the tree to be positioned.
// If all levels are to be positioned,
// set this value to positive infinity (or an appropriate numerical value).

// SiblingSeparation: The minimum distance between adjacent siblings of the tree.

// SubtreeSeparation: The minimum distance between adjacent subtrees of a tree.
// For proper aesthetics, this value is normally somewhat larger than SiblingSeparation.
define(function() {
    'use strict';

    var  DvConfig = {
        MaximumDepth:100,
        SiblingSeparation:80,
        SubtreeSeparation:80,
        LevelSeparation:120,
    }

    return DvConfig;
});