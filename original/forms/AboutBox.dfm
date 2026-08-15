object AboutBox: TAboutBox
  Left = 197
  Top = 187
  BorderStyle = bsDialog
  Caption = 'About Creatures'
  ClientHeight = 246
  ClientWidth = 435
  Font.Color = clWindowText
  Font.Height = -13
  Font.Name = 'System'
  Font.Style = []
  PixelsPerInch = 96
  Position = poScreenCenter
  OnCreate = FormCreate
  TextHeight = 16
  object Panel1: TPanel
    Left = 15
    Top = 20
    Width = 405
    Height = 185
    BevelInner = bvRaised
    BevelOuter = bvLowered
    TabOrder = 0
    object Label2: TLabel
      Left = 181
      Top = 69
      Width = 195
      Height = 16
      Caption = 'Change your colour resolution'
    end
    object Label1: TLabel
      Left = 205
      Top = 39
      Width = 114
      Height = 16
      Caption = 'What, no picture?'
    end
    object Label3: TLabel
      Left = 201
      Top = 99
      Width = 128
      Height = 16
      Caption = 'At least 256 colours'
    end
    object Image1: TImage
      Left = 173
      Top = 14
      Width = 217
      Height = 131
      Picture.Data = {
        07544269746D617016790000424D16790000000000003604000028000000DC00
        0000880000000100080000000000E07400000000000000000000000100000001
        0000000000000008000008080000001000000810000000000800000808000808
        0800100808000010080008100800000C1000000C1800080810000C0814001008
        1800081010001010080008180800101808000C21080008181000082110000810
        180010101000181008001810100010181000181C0800141C1000182110002118
        1000040C2100101018000018180008181C001018180008211800082121001021
        1800181018001818180014102100101821001818210021181800211821001821
        ... (31010 bytes total)
      }
    end
    object ProductName: TLabel
      Left = 10
      Top = 12
      Width = 137
      Height = 23
      Caption = 'Creatures!'
      Font.Color = clMaroon
      Font.Height = -21
      Font.Name = 'Arial Black'
      Font.Style = [fsBold, fsItalic]
      ParentFont = False
      IsControl = True
    end
    object Version: TLabel
      Left = 10
      Top = 37
      Width = 69
      Height = 13
      Caption = 'Version 1.0f'
      Font.Color = clBlack
      Font.Height = -11
      Font.Name = 'MS Sans Serif'
      Font.Style = [fsBold]
      ParentFont = False
      IsControl = True
    end
    object Copyright: TLabel
      Left = 173
      Top = 167
      Width = 100
      Height = 13
      Caption = 'Copyright ' + #169 + ' 1996'
      Font.Color = clBlack
      Font.Height = -11
      Font.Name = 'MS Sans Serif'
      Font.Style = [fsBold]
      ParentFont = False
      IsControl = True
    end
    object Label4: TLabel
      Left = 173
      Top = 147
      Width = 221
      Height = 16
      Caption = 'published by Future Skill Software'
    end
    object Label5: TLabel
      Left = 10
      Top = 62
      Width = 135
      Height = 16
      Caption = 'Population Simulator'
    end
    object Label6: TLabel
      Left = 10
      Top = 79
      Width = 142
      Height = 16
      Caption = 'for GCSE and ''A'' level'
    end
    object Label7: TLabel
      Left = 10
      Top = 102
      Width = 113
      Height = 16
      Caption = 'Single User Copy'
    end
    object Label8: TLabel
      Left = 11
      Top = 123
      Width = 154
      Height = 16
      Caption = 'Network/Multiuser Copy'
      Visible = False
    end
  end
  object btnAboutOK: TButton
    Left = 150
    Top = 211
    Width = 128
    Height = 28
    Caption = 'OK'
    Default = True
    ModalResult = 1
    TabOrder = 1
  end
end
