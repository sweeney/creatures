object frmProtect: TfrmProtect
  Left = 200
  Top = 99
  BorderIcons = []
  BorderStyle = bsDialog
  Caption = 'Demonstration Version'
  ClientHeight = 364
  ClientWidth = 412
  Font.Color = clWindowText
  Font.Height = -13
  Font.Name = 'System'
  Font.Style = []
  PixelsPerInch = 96
  TextHeight = 16
  object EPImage1: TEPImage
    Left = 180
    Top = 290
    Width = 190
    Height = 63
    Picture.Data = {
      07544269746D617076330000424D76330000000000003604000028000000BE00
      00003F0000000100080000000000402F00000000000000000000000100000001
      000000000000000080000080000000808000800000008000800080800000C0C0
      C000C0DCC000F0C8A40040000000A0000000C000000000400000404000008040
      0000A0400000C0400000FF40000040800000A0800000C0800000FF80000000A0
      000040A0000080A00000A0A00000C0A00000FFA0000000C0000040C0000080C0
      0000A0C00000C0C00000FFC0000040FF000080FF0000A0FF0000C0FF00000000
      40004000400080004000A0004000C0004000FF00400000404000404040008040
      ... (13186 bytes total)
    }
    Transparent = True
    TransparentColor = clBlack
  end
  object Label1: TLabel
    Left = 19
    Top = 7
    Width = 241
    Height = 48
    Caption = ' has a time lock which has now been activated. It will run for only # seconds before terminating.'
    Font.Color = clWindowText
    Font.Height = -13
    Font.Name = 'System'
    Font.Style = []
    ParentFont = False
    WordWrap = True
  end
  object Label3: TLabel
    Left = 20
    Top = 74
    Width = 333
    Height = 64
    Caption = 'If you wish to obtain the full commerial version which can be used for an unlimited amount of time, then please write for further details and our latest catalogue to:'
    WordWrap = True
  end
  object Label4: TLabel
    Left = 20
    Top = 150
    Width = 133
    Height = 16
    Caption = 'Future Skill Software'
  end
  object Label5: TLabel
    Left = 21
    Top = 168
    Width = 62
    Height = 16
    Caption = 'Penrodyn'
  end
  object Label6: TLabel
    Left = 21
    Top = 186
    Width = 103
    Height = 16
    Caption = 'Pontrhydygroes'
  end
  object Label7: TLabel
    Left = 21
    Top = 203
    Width = 92
    Height = 16
    Caption = 'Ystrad Meurig'
  end
  object Label8: TLabel
    Left = 21
    Top = 220
    Width = 112
    Height = 16
    Caption = 'Dyfed, SY25 6DP'
  end
  object Label9: TLabel
    Left = 21
    Top = 253
    Width = 120
    Height = 16
    Caption = 'Tel: 01974 282428'
  end
  object Label10: TLabel
    Left = 192
    Top = 150
    Width = 173
    Height = 32
    Caption = 'A Single User Licence can be obtained for only:'
    WordWrap = True
  end
  object Label11: TLabel
    Left = 192
    Top = 186
    Width = 125
    Height = 16
    Caption = #163 + '19.95 + ' + #163 + '1.60 p&&p'
    Font.Color = clRed
    Font.Height = -13
    Font.Name = 'System'
    Font.Style = []
    ParentFont = False
  end
  object Label12: TLabel
    Left = 192
    Top = 213
    Width = 231
    Height = 33
    Caption = 'or a 20 User Network/Multiuser licence for only:'
    WordWrap = True
  end
  object Label13: TLabel
    Left = 192
    Top = 253
    Width = 125
    Height = 16
    Caption = #163 + '29.95 + ' + #163 + '1.60 p&&p'
    Font.Color = clRed
    Font.Height = -13
    Font.Name = 'System'
    Font.Style = []
    ParentFont = False
  end
  object EPImage2: TEPImage
    Left = 330
    Top = 2
    Width = 37
    Height = 47
    Picture.Data = {
      09544D65746166696C65B6790000D7CDC69A000000000000CA029B03E8030000
      0000A855010009000003CC3C00000400640800000000050000000B026BFD20F7
      050000000C0265FCCA02040000000601010007000000FC020000FFFF00000000
      040000002D01000008000000FA02050000000000FFFFFF00040000002D010100
      0400000006010100280000003805020005000C0066F8C5FCA3F8C5FCA3F88CFC
      66F88CFC66F8C5FC52F800FD5FF805FD6CF809FD78F80BFD85F80CFD92F80BFD
      9FF809FDABF805FDB7F800FDB7F8C5FC52F8C5FC52F800FD08000000FA020000
      0000000000000000040000002D01020007000000FC020000FFFFFF0000000400
      ... (31172 bytes total)
    }
    Style = episStretch
  end
  object btnTerminate: TButton
    Left = 47
    Top = 304
    Width = 105
    Height = 34
    Caption = 'Terminate'
    ModalResult = 1
    TabOrder = 0
    OnClick = btnTerminateClick
  end
  object TimeLock: TTimer
    Enabled = False
    OnTimer = TimeLockTimer
    Left = 376
    Top = 143
  end
end
