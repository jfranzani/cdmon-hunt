import { Injectable } from '@angular/core';
import {
  findSpecificCell,
  isCellAlreadyTaken,
  isCoordinateInvalid,
} from '../core/helpers/helper-functions';
import {
  AxisDirection,
  BoardCoordinate,
  Cell,
  LocationPath,
  PathFinderStatus,
  SearcheableCellAttr,
} from '../core/models/game';

@Injectable({
  providedIn: 'root',
})
export class PathCreatorService {
  constructor() {}

  /**
   * Create a Path to gold to make sure that the player
   * will be able to reach the gold and go back
   * without being blocked for pits or the Wumpus
   * @param cells
   */
  createCleanPathToGold(cells: Cell[][]) {
    let escapeCell = findSpecificCell(cells, SearcheableCellAttr.isEscape);
    let path = this.findPath(cells, escapeCell);
    for (let coordinate of path.slice(0, path.length - 1)) {
      let cube = cells[coordinate.Y][coordinate.X];
      cube.isClearPath = true;
    }
  }

  findPath(board: Cell[][], escapeCell: Cell): BoardCoordinate[] {
    let distanceFromTop = escapeCell.coordinateY;
    let distanceFromLeft = escapeCell.coordinateX;

    // Each "location" will store its coordinates
    // and the shortest path required to arrive there
    let location: LocationPath = {
      distanceFromTop: distanceFromTop,
      distanceFromLeft: distanceFromLeft,
      path: [],
      status: PathFinderStatus.Start,
    };

    // Initialize the queue with the start location already inside
    let queue = [location];

    // Loop through the board searching for the gold
    while (queue.length > 0) {
      // Take the first location off the queue
      let currentLocation = queue.shift();

      let newLocation;
      // Explore North
      newLocation = this.exploreInDirection(
        currentLocation,
        AxisDirection.North,
        board
      );
      if (newLocation.status === PathFinderStatus.Gold) {
        return newLocation.path;
      }
      this.checkPushLocationToQueue(newLocation, queue);

      // Explore East
      newLocation = this.exploreInDirection(
        currentLocation,
        AxisDirection.East,
        board
      );
      if (newLocation.status === PathFinderStatus.Gold) {
        return newLocation.path;
      }
      this.checkPushLocationToQueue(newLocation, queue);

      // Explore South
      newLocation = this.exploreInDirection(
        currentLocation,
        AxisDirection.South,
        board
      );
      if (newLocation.status === PathFinderStatus.Gold) {
        return newLocation.path;
      }
      this.checkPushLocationToQueue(newLocation, queue);

      // Explore West
      newLocation = this.exploreInDirection(
        currentLocation,
        AxisDirection.West,
        board
      );
      if (newLocation.status === PathFinderStatus.Gold) {
        return newLocation.path;
      }
      this.checkPushLocationToQueue(newLocation, queue);
    }

    // No valid path found
    return null;
  }

  checkPushLocationToQueue(newLocation: LocationPath, queue: LocationPath[]) {
    if (newLocation.status === PathFinderStatus.Valid) {
      queue.push(newLocation);
    }
  }

  // This function will check a location's status
  // (a location is "valid" if it is on the board, is not an "obstacle",
  // and has not yet been visited by our algorithm)
  locationStatus(location: LocationPath, board: Cell[][]): PathFinderStatus {
    let boardSize = board.length;
    let coordY = location.distanceFromTop;
    let coordX = location.distanceFromLeft;

    // Out of the limits of the board
    if (isCoordinateInvalid(coordX, coordY, boardSize)) {
      return PathFinderStatus.Invalid;
    }

    if (board[coordY][coordX].hasGold) {
      return PathFinderStatus.Gold;
    }

    if (isCellAlreadyTaken(board[coordY][coordX])) {
      // location is either an obstacle or has been visited
      return PathFinderStatus.Blocked;
    }

    return PathFinderStatus.Valid;
  }

  // Explores the grid from the given location in the given
  // direction
  exploreInDirection(
    currentLocation: LocationPath,
    direction: AxisDirection,
    board: Cell[][]
  ) {
    let newPath = currentLocation.path.slice();
    let dft = currentLocation.distanceFromTop;
    let dfl = currentLocation.distanceFromLeft;

    switch (direction) {
      case AxisDirection.North:
        dft -= 1;
        break;
      case AxisDirection.East:
        dfl += 1;
        break;
      case AxisDirection.South:
        dft += 1;
        break;
      case AxisDirection.West:
        dfl -= 1;
        break;
    }

    newPath.push({ X: dfl, Y: dft });

    let newLocation = {
      distanceFromTop: dft,
      distanceFromLeft: dfl,
      path: newPath,
      status: PathFinderStatus.Unknown,
    };

    newLocation.status = this.locationStatus(newLocation, board);

    // If this new location is valid, mark it as 'Visited'
    if (newLocation.status === PathFinderStatus.Valid) {
      board[newLocation.distanceFromTop][newLocation.distanceFromLeft].status =
        PathFinderStatus.Valid;
    }

    return newLocation;
  }
}
