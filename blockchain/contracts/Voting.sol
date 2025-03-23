// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Voting {
    struct Candidate {
        uint256 id;
        string name;
        string party;
        uint256 voteCount;
        bool exists;
    }

    struct Election {
        uint256 id;
        string title;
        string description;
        uint256 startTime;
        uint256 endTime;
        bool isActive;
        bool exists;
    }

    struct Vote {
        address voter;
        uint256 candidateId;
        uint256 timestamp;
        bool exists;
    }

    // State variables
    uint256 private electionCount;
    uint256 private candidateCount;
    mapping(uint256 => Election) public elections;
    mapping(uint256 => mapping(uint256 => Candidate)) public candidates;
    mapping(uint256 => mapping(address => Vote)) public votes;
    mapping(address => bool) public verifiedVoters;
    address public admin;

    // Events
    event ElectionCreated(uint256 indexed electionId, string title);
    event CandidateAdded(uint256 indexed electionId, uint256 indexed candidateId, string name);
    event VoteCast(uint256 indexed electionId, uint256 indexed candidateId, address indexed voter);
    event VoterVerified(address indexed voter);
    event ElectionStatusChanged(uint256 indexed electionId, bool isActive);

    // Modifiers
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    modifier onlyVerifiedVoter() {
        require(verifiedVoters[msg.sender], "Only verified voters can vote");
        _;
    }

    modifier electionExists(uint256 _electionId) {
        require(elections[_electionId].exists, "Election does not exist");
        _;
    }

    modifier electionActive(uint256 _electionId) {
        require(elections[_electionId].isActive, "Election is not active");
        require(block.timestamp >= elections[_electionId].startTime, "Election has not started");
        require(block.timestamp <= elections[_electionId].endTime, "Election has ended");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    // Admin functions
    function createElection(
        string memory _title,
        string memory _description,
        uint256 _startTime,
        uint256 _endTime
    ) public onlyAdmin returns (uint256) {
        require(_startTime < _endTime, "End time must be after start time");
        require(_startTime > block.timestamp, "Start time must be in the future");

        electionCount++;
        elections[electionCount] = Election({
            id: electionCount,
            title: _title,
            description: _description,
            startTime: _startTime,
            endTime: _endTime,
            isActive: false,
            exists: true
        });

        emit ElectionCreated(electionCount, _title);
        return electionCount;
    }

    function addCandidate(
        uint256 _electionId,
        string memory _name,
        string memory _party
    ) public onlyAdmin electionExists(_electionId) returns (uint256) {
        require(!elections[_electionId].isActive, "Cannot add candidates to active election");

        candidateCount++;
        candidates[_electionId][candidateCount] = Candidate({
            id: candidateCount,
            name: _name,
            party: _party,
            voteCount: 0,
            exists: true
        });

        emit CandidateAdded(_electionId, candidateCount, _name);
        return candidateCount;
    }

    function verifyVoter(address _voter) public onlyAdmin {
        verifiedVoters[_voter] = true;
        emit VoterVerified(_voter);
    }

    function setElectionStatus(uint256 _electionId, bool _isActive) public onlyAdmin electionExists(_electionId) {
        require(
            !_isActive || block.timestamp >= elections[_electionId].startTime,
            "Cannot activate election before start time"
        );
        elections[_electionId].isActive = _isActive;
        emit ElectionStatusChanged(_electionId, _isActive);
    }

    // Voter functions
    function castVote(uint256 _electionId, uint256 _candidateId)
        public
        onlyVerifiedVoter
        electionExists(_electionId)
        electionActive(_electionId)
    {
        require(candidates[_electionId][_candidateId].exists, "Candidate does not exist");
        require(!votes[_electionId][msg.sender].exists, "Already voted in this election");

        votes[_electionId][msg.sender] = Vote({
            voter: msg.sender,
            candidateId: _candidateId,
            timestamp: block.timestamp,
            exists: true
        });

        candidates[_electionId][_candidateId].voteCount++;
        emit VoteCast(_electionId, _candidateId, msg.sender);
    }

    // View functions
    function getElection(uint256 _electionId) public view returns (
        uint256 id,
        string memory title,
        string memory description,
        uint256 startTime,
        uint256 endTime,
        bool isActive
    ) {
        require(elections[_electionId].exists, "Election does not exist");
        Election memory election = elections[_electionId];
        return (
            election.id,
            election.title,
            election.description,
            election.startTime,
            election.endTime,
            election.isActive
        );
    }

    function getCandidate(uint256 _electionId, uint256 _candidateId) public view returns (
        uint256 id,
        string memory name,
        string memory party,
        uint256 voteCount
    ) {
        require(candidates[_electionId][_candidateId].exists, "Candidate does not exist");
        Candidate memory candidate = candidates[_electionId][_candidateId];
        return (
            candidate.id,
            candidate.name,
            candidate.party,
            candidate.voteCount
        );
    }

    function getVote(uint256 _electionId, address _voter) public view returns (
        uint256 candidateId,
        uint256 timestamp
    ) {
        require(votes[_electionId][_voter].exists, "Vote does not exist");
        Vote memory vote = votes[_electionId][_voter];
        return (vote.candidateId, vote.timestamp);
    }

    function isVoterVerified(address _voter) public view returns (bool) {
        return verifiedVoters[_voter];
    }

    function getElectionCount() public view returns (uint256) {
        return electionCount;
    }

    function getCandidateCount(uint256 _electionId) public view returns (uint256) {
        return candidateCount;
    }
} 