

// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;
import {BridgeImplementation} from "../contracts/bridge/BridgeImplementation.sol";
import {BridgeSetup} from "../contracts/bridge/BridgeSetup.sol";
import {TokenImplementation} from "../contracts/bridge/token/TokenImplementation.sol";
import {Setup} from "../contracts/Setup.sol";
import "forge-std/Script.sol";

contract DeployTokenBridge is Script {
    // DryRun - Deploy the system
    // dry run: forge script DeployCore --sig "dryRun()" --rpc-url $RPC
    function dryRun() public {
        _deploy();
    }
    // Deploy the system
    // deploy:  forge script DeployCore --sig "run()" --rpc-url $RPC --etherscan-api-key $ETHERSCAN_API_KEY --private-key $RAW_PRIVATE_KEY --broadcast --verify
    function run() public {
        vm.startBroadcast();
        _deploy();
        vm.stopBroadcast();
    }
    function _deploy() internal returns (BridgeImplementation impl) {
        impl = new Implementation();
        Setup setup = new Setup();

        address[] memory initialSigners = vm.envAddress("INIT_SIGNERS", ",");
        uint16 chainId = uint16(vm.envUint("INIT_CHAIN_ID"));
        uint16 governanceChainId = uint16(vm.envUint("INIT_GOV_CHAIN_ID"));
        bytes32 governanceContract = bytes32(vm.envBytes32("INIT_GOV_CONTRACT"));
        uint256 evmChainId = vm.envUint("INIT_EVM_CHAIN_ID");
        
        setup.setup(address(impl), initialSigners, chainId, governanceChainId, governanceContract, evmChainId);

        // TODO: initialize?
    }
}