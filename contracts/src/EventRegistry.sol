// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title  EventRegistry
 * @notice Stores SHA-256 QR hashes of paid event registrations on-chain.
 *         Each record is immutable — once written it cannot be deleted or changed.
 *         The backend writes one record per successful payment; the validator
 *         reads MongoDB (fast), and on-chain provides an independent audit trail.
 */
contract EventRegistry {

    // ── Data ──────────────────────────────────────────────────────────────────

    struct Registration {
        string  userId;
        string  eventId;
        uint256 timestamp;
        bool    exists;
    }

    // qrHash => Registration
    mapping(string => Registration) private registrations;

    // Ordered list of all hashes (for enumeration / admin queries)
    string[] private allHashes;

    // Owner can pause the contract in emergencies
    address public owner;
    bool    public paused;

    // ── Events ────────────────────────────────────────────────────────────────

    event Registered(
        string indexed qrHash,
        string         userId,
        string         eventId,
        uint256        timestamp
    );

    event Paused(address by);
    event Unpaused(address by);

    // ── Modifiers ─────────────────────────────────────────────────────────────

    modifier onlyOwner() {
        require(msg.sender == owner, "EventRegistry: not owner");
        _;
    }

    modifier whenNotPaused() {
        require(!paused, "EventRegistry: contract is paused");
        _;
    }

    // ── Constructor ───────────────────────────────────────────────────────────

    constructor() {
        owner = msg.sender;
    }

    // ── Write ─────────────────────────────────────────────────────────────────

    /**
     * @notice Register a participant. Called by the backend after payment verification.
     * @param qrHash  SHA-256 hex string of (paymentId:userId:eventId:timestamp)
     * @param userId  MongoDB User _id as string
     * @param eventId MongoDB Event _id as string
     */
    function registerParticipant(
        string calldata qrHash,
        string calldata userId,
        string calldata eventId
    ) external whenNotPaused {
        require(bytes(qrHash).length == 64, "EventRegistry: invalid hash length");
        require(!registrations[qrHash].exists, "EventRegistry: hash already registered");

        registrations[qrHash] = Registration({
            userId:    userId,
            eventId:   eventId,
            timestamp: block.timestamp,
            exists:    true
        });

        allHashes.push(qrHash);

        emit Registered(qrHash, userId, eventId, block.timestamp);
    }

    // ── Read ──────────────────────────────────────────────────────────────────

    /**
     * @notice Check whether a QR hash is recorded on-chain.
     */
    function isRegistered(string calldata qrHash) external view returns (bool) {
        return registrations[qrHash].exists;
    }

    /**
     * @notice Retrieve full registration data for a given QR hash.
     */
    function getRegistration(string calldata qrHash)
        external
        view
        returns (string memory userId, string memory eventId, uint256 timestamp)
    {
        Registration storage r = registrations[qrHash];
        require(r.exists, "EventRegistry: not found");
        return (r.userId, r.eventId, r.timestamp);
    }

    /**
     * @notice Total number of registrations stored on-chain.
     */
    function totalRegistrations() external view returns (uint256) {
        return allHashes.length;
    }

    // ── Admin ─────────────────────────────────────────────────────────────────

    function pause()   external onlyOwner { paused = true;  emit Paused(msg.sender); }
    function unpause() external onlyOwner { paused = false; emit Unpaused(msg.sender); }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "EventRegistry: zero address");
        owner = newOwner;
    }
}
