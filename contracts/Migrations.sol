pragma solidity 0.5.3;

contract Migrations {
  address public owner;

  uint public last_completed_migration;

  constructor() public {
    owner = msg.sender;
  }

  function setCompleted(uint completed) public {
    require(msg.sender == owner);
    last_completed_migration = completed;
  }

  function upgrade(address new_address) public {
    require(msg.sender == owner);
    Migrations upgraded = Migrations(new_address);
    upgraded.setCompleted(last_completed_migration);
  }
}
