class Env(object):
  nextId = 0

  def __init__(self, sourceLoc, parentEnv, callerEnv, programOrSendEvent):
    self.id = Env.nextId
    Env.nextId += 1

    self.sourceLoc = sourceLoc
    self.callerEnv = callerEnv
    self.parentEnv = parentEnv
    self.programOrSendEvent = programOrSendEvent
    self.currentSendEvent = None
    try:
      self.declEnvs = self.parentEnv.declEnvs.copy() # will copying at beginning hold up?
    except AttributeError:
      self.declEnvs = {}
  
  def declVar(self, name):
    if name in self.declEnvs:
      raise Exception(name + 'is already declared')
    self.declEnvs[name] = self
    return self
  
  def declEnv(self, name):
    return self.declEnvs.get(name)
  
  def toJSON(self):
    return {
      'id': self.id,
      'parentEnvId': self.parentEnv.id if self.parentEnv != None else None,
      'callerEnvId': self.callerEnv.id if self.callerEnv != None else None
    }