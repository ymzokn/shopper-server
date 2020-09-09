const express = require("express");
const List = require("../models/list");
const router = new express.Router();
const auth = require("../middleware/auth");
const author = require("../middleware/author");
const sub = require("../middleware/sub");

router.get("/lists", auth, async (req, res) => {
  try {
    const lists = await List.find({ subscribers: req.user._id });
    res.send(lists);
  } catch (e) {
    res.status(404).send();
  }
});

router.get("/lists/:id", auth, async (req, res) => {
  try {
    const list = await List.findById({ _id: req.params.id });
    if (!list.subscribers.includes(req.user._id.toString())) {
      return res.status(401).send();
    }

    if (!list) {
      return res.status(404).send();
    }
    await list.populate("author").execPopulate();
    await list.populate("subscribers").execPopulate();

    res.send(list);
  } catch (e) {
    res.status(500).send();
  }
});

router.post("/lists", auth, async (req, res) => {
  try {
    const list = new List(req.body);
    // await list.save()
    list.saveListAuthorAndSubscribe(req.user);
    res.send(list);
  } catch (e) {
    res.status(500).send();
  }
});

router.get("/lists/invite/:id", [auth, sub], async (req, res) => {
  try {
    const list = await List.findById(req.params.id);
    if (!list) {
      res.status(404).send();
    }

    list.generateInviteCode(req.user);
    res.send(list.inviteCode);
  } catch (error) {
    res.status(500).send();
  }
});

router.post("/lists/join/:code", auth, async (req, res) => {
  try {
    const list = await List.findOne({ inviteCode: req.params.code });
    if (!list) {
      res.status(404).send();
    }

    // if (list.inviteCode !== req.body.inviteCode) {
    //     res.status(401).send()
    // }
    list.subscribers = [...list.subscribers, req.user];
    list.inviteCode = "";
    await list.save();
    res.send(list);
  } catch (e) {
    res.status(500).send();
  }
});

router.patch("/lists/:id", [auth, sub], async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["subscribers", "items"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );
  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid Updates" });
  }

  try {
    const list = req.list;

    updates.forEach((update) => {
      list[update] = req.body[update];
    });

    await list.save();

    if (!list) {
      return res.status(404).send();
    }

    res.send(list);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.delete("/lists/:id", [auth, sub], async (req, res) => {
  try {
    const list = req.list;
    if (!list) {
      return res.status(404).send();
    }
    if (list.author.toString() === req.user.id) {
      list.remove();
      res.status(204).send();
    } else {
      list.subscribers = list.subscribers.filter((sub) => {
        return sub.toString() !== req.user.id;
      });
      await list.save();
      res.status(200).send();
    }
  } catch (e) {
    res.status(500).send();
  }
});

module.exports = router;
