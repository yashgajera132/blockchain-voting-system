const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Voting", function () {
  let Voting;
  let voting;
  let owner;
  let addr1;
  let addr2;
  let addr3;

  beforeEach(async function () {
    [owner, addr1, addr2, addr3] = await ethers.getSigners();
    Voting = await ethers.getContractFactory("Voting");
    voting = await Voting.deploy();
    await voting.deployed();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await voting.admin()).to.equal(owner.address);
    });
  });

  describe("Election Creation", function () {
    it("Should create a new election", async function () {
      const startTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const endTime = startTime + 7200; // 2 hours after start

      await voting.createElection(
        "Test Election",
        "Test Description",
        startTime,
        endTime
      );

      const election = await voting.getElection(1);
      expect(election.title).to.equal("Test Election");
      expect(election.description).to.equal("Test Description");
      expect(election.startTime).to.equal(startTime);
      expect(election.endTime).to.equal(endTime);
      expect(election.isActive).to.equal(false);
    });

    it("Should fail if end time is before start time", async function () {
      const startTime = Math.floor(Date.now() / 1000) + 3600;
      const endTime = startTime - 1800;

      await expect(
        voting.createElection(
          "Test Election",
          "Test Description",
          startTime,
          endTime
        )
      ).to.be.revertedWith("End time must be after start time");
    });
  });

  describe("Candidate Management", function () {
    beforeEach(async function () {
      const startTime = Math.floor(Date.now() / 1000) + 3600;
      const endTime = startTime + 7200;
      await voting.createElection(
        "Test Election",
        "Test Description",
        startTime,
        endTime
      );
    });

    it("Should add a candidate", async function () {
      await voting.addCandidate(1, "Test Candidate", "Test Party");

      const candidate = await voting.getCandidate(1, 1);
      expect(candidate.name).to.equal("Test Candidate");
      expect(candidate.party).to.equal("Test Party");
      expect(candidate.voteCount).to.equal(0);
    });

    it("Should fail if non-admin tries to add candidate", async function () {
      await expect(
        voting.connect(addr1).addCandidate(1, "Test Candidate", "Test Party")
      ).to.be.revertedWith("Only admin can perform this action");
    });
  });

  describe("Voting", function () {
    beforeEach(async function () {
      const startTime = Math.floor(Date.now() / 1000) + 3600;
      const endTime = startTime + 7200;
      await voting.createElection(
        "Test Election",
        "Test Description",
        startTime,
        endTime
      );
      await voting.addCandidate(1, "Test Candidate", "Test Party");
      await voting.verifyVoter(addr1.address);
      await voting.setElectionStatus(1, true);
    });

    it("Should allow verified voter to cast vote", async function () {
      await voting.connect(addr1).castVote(1, 1);

      const vote = await voting.getVote(1, addr1.address);
      expect(vote.candidateId).to.equal(1);
      expect(vote.timestamp).to.be.gt(0);

      const candidate = await voting.getCandidate(1, 1);
      expect(candidate.voteCount).to.equal(1);
    });

    it("Should fail if unverified voter tries to vote", async function () {
      await expect(
        voting.connect(addr2).castVote(1, 1)
      ).to.be.revertedWith("Only verified voters can vote");
    });

    it("Should fail if voter tries to vote twice", async function () {
      await voting.connect(addr1).castVote(1, 1);
      await expect(
        voting.connect(addr1).castVote(1, 1)
      ).to.be.revertedWith("Already voted in this election");
    });
  });

  describe("Voter Verification", function () {
    it("Should verify a voter", async function () {
      await voting.verifyVoter(addr1.address);
      expect(await voting.isVoterVerified(addr1.address)).to.equal(true);
    });

    it("Should fail if non-admin tries to verify voter", async function () {
      await expect(
        voting.connect(addr1).verifyVoter(addr2.address)
      ).to.be.revertedWith("Only admin can perform this action");
    });
  });
}); 