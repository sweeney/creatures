object ConfigBox: TConfigBox
  Left = 93
  Top = 101
  ActiveControl = OKBtn
  BorderIcons = [biSystemMenu]
  BorderStyle = bsDialog
  Caption = 'Configure Parameters'
  ClientHeight = 418
  ClientWidth = 515
  Font.Color = clBlack
  Font.Height = -11
  Font.Name = 'MS Sans Serif'
  Font.Style = [fsBold]
  PixelsPerInch = 96
  Position = poScreenCenter
  OnClick = GroupBox1Click
  OnClose = FormClose
  OnShow = FormShow
  TextHeight = 13
  object GroupBox1: TGroupBox
    Left = 6
    Top = 8
    Width = 248
    Height = 373
    Caption = ' Reproductive Probabilities Array '
    TabOrder = 2
    OnClick = GroupBox1Click
    object Sqr1: TShape
      Tag = 1
      Left = 53
      Top = 151
      Width = 16
      Height = 16
      Brush.Color = clRed
      OnMouseDown = Shape4MouseDown
    end
    object sqr2: TShape
      Tag = 2
      Left = 109
      Top = 151
      Width = 16
      Height = 16
      Brush.Color = clSilver
      OnMouseDown = Shape4MouseDown
    end
    object lbl2: TLabel
      Tag = 2
      Left = 113
      Top = 152
      Width = 8
      Height = 12
      Caption = '2'
      OnMouseDown = Shape4MouseDown
    end
    object lbl1: TLabel
      Tag = 1
      Left = 57
      Top = 152
      Width = 8
      Height = 12
      Caption = '1'
      Color = clRed
      ParentColor = False
      OnMouseDown = Shape4MouseDown
    end
    object sqr5: TShape
      Tag = 5
      Left = 168
      Top = 285
      Width = 16
      Height = 16
      Brush.Color = clSilver
      OnMouseDown = Shape4MouseDown
    end
    object sqr6: TShape
      Tag = 6
      Left = 111
      Top = 286
      Width = 16
      Height = 16
      Brush.Color = clSilver
      OnMouseDown = Shape4MouseDown
    end
    object sqr7: TShape
      Tag = 7
      Left = 54
      Top = 285
      Width = 16
      Height = 16
      Brush.Color = clSilver
      OnMouseDown = Shape4MouseDown
    end
    object sqr4: TShape
      Tag = 4
      Left = 167
      Top = 217
      Width = 16
      Height = 16
      Brush.Color = clSilver
      OnMouseDown = Shape4MouseDown
    end
    object sqr8: TShape
      Tag = 8
      Left = 53
      Top = 217
      Width = 16
      Height = 16
      Brush.Color = clSilver
      OnMouseDown = Shape4MouseDown
    end
    object sqr3: TShape
      Tag = 3
      Left = 165
      Top = 151
      Width = 16
      Height = 16
      Brush.Color = clSilver
      OnMouseDown = Shape4MouseDown
    end
    object Label1: TLabel
      Left = 10
      Top = 23
      Width = 225
      Height = 70
      Caption = 'The likelihood of a rabbit reproducing depends on the number of free squares around the animal. The array below shows the current probabilities for the eight possible patterns of vacancies.'
      Font.Color = clBlack
      Font.Height = -11
      Font.Name = 'Arial'
      Font.Style = []
      ParentFont = False
      WordWrap = True
    end
    object lbl8: TLabel
      Tag = 8
      Left = 57
      Top = 218
      Width = 8
      Height = 13
      Caption = '8'
      OnMouseDown = Shape4MouseDown
    end
    object lbl3: TLabel
      Tag = 3
      Left = 169
      Top = 152
      Width = 8
      Height = 13
      Caption = '3'
      OnMouseDown = Shape4MouseDown
    end
    object lbl4: TLabel
      Tag = 4
      Left = 170
      Top = 219
      Width = 8
      Height = 13
      Caption = '4'
      OnMouseDown = Shape4MouseDown
    end
    object lbl5: TLabel
      Tag = 5
      Left = 172
      Top = 287
      Width = 8
      Height = 13
      Caption = '5'
      OnMouseDown = Shape4MouseDown
    end
    object lbl6: TLabel
      Tag = 6
      Left = 115
      Top = 287
      Width = 8
      Height = 13
      Caption = '6'
      OnMouseDown = Shape4MouseDown
    end
    object lbl7: TLabel
      Tag = 7
      Left = 58
      Top = 287
      Width = 8
      Height = 13
      Caption = '7'
      OnMouseDown = Shape4MouseDown
    end
    object Shape1: TShape
      Tag = 1
      Left = 53
      Top = 136
      Width = 16
      Height = 16
      Brush.Color = clMaroon
      OnMouseDown = Shape4MouseDown
    end
    object Shape2: TShape
      Tag = 1
      Left = 68
      Top = 151
      Width = 16
      Height = 16
      Brush.Color = clMaroon
      OnMouseDown = Shape4MouseDown
    end
    object Shape3: TShape
      Tag = 1
      Left = 68
      Top = 136
      Width = 16
      Height = 16
      Brush.Color = clMaroon
      OnMouseDown = Shape4MouseDown
    end
    object Shape4: TShape
      Tag = 1
      Left = 38
      Top = 136
      Width = 16
      Height = 16
      OnMouseDown = Shape4MouseDown
    end
    object Shape5: TShape
      Tag = 1
      Left = 38
      Top = 151
      Width = 16
      Height = 16
      Brush.Color = clMaroon
      OnMouseDown = Shape4MouseDown
    end
    object Shape7: TShape
      Tag = 1
      Left = 68
      Top = 166
      Width = 16
      Height = 16
      Brush.Color = clMaroon
      OnMouseDown = Shape4MouseDown
    end
    object Shape8: TShape
      Tag = 1
      Left = 38
      Top = 166
      Width = 16
      Height = 16
      Brush.Color = clMaroon
      OnMouseDown = Shape4MouseDown
    end
    object Shape9: TShape
      Tag = 2
      Left = 94
      Top = 136
      Width = 16
      Height = 16
      OnMouseDown = Shape4MouseDown
    end
    object Shape10: TShape
      Tag = 2
      Left = 109
      Top = 136
      Width = 16
      Height = 16
      OnMouseDown = Shape4MouseDown
    end
    object Shape11: TShape
      Tag = 2
      Left = 124
      Top = 136
      Width = 16
      Height = 16
      Brush.Color = clMaroon
      OnMouseDown = Shape4MouseDown
    end
    object Shape12: TShape
      Tag = 2
      Left = 94
      Top = 151
      Width = 16
      Height = 16
      Brush.Color = clMaroon
      OnMouseDown = Shape4MouseDown
    end
    object Shape13: TShape
      Tag = 2
      Left = 124
      Top = 151
      Width = 16
      Height = 16
      Brush.Color = clMaroon
      OnMouseDown = Shape4MouseDown
    end
    object Shape14: TShape
      Tag = 2
      Left = 124
      Top = 166
      Width = 16
      Height = 16
      Brush.Color = clMaroon
      OnMouseDown = Shape4MouseDown
    end
    object Shape16: TShape
      Tag = 2
      Left = 94
      Top = 166
      Width = 16
      Height = 16
      Brush.Color = clMaroon
      OnMouseDown = Shape4MouseDown
    end
    object Shape17: TShape
      Tag = 3
      Left = 150
      Top = 136
      Width = 16
      Height = 16
      OnMouseDown = Shape4MouseDown
    end
    object Shape18: TShape
      Tag = 3
      Left = 165
      Top = 136
      Width = 16
      Height = 16
      OnMouseDown = Shape4MouseDown
    end
    object Shape19: TShape
      Tag = 3
      Left = 180
      Top = 136
      Width = 16
      Height = 16
      OnMouseDown = Shape4MouseDown
    end
    object Shape21: TShape
      Tag = 3
      Left = 180
      Top = 151
      Width = 16
      Height = 16
      Brush.Color = clMaroon
      OnMouseDown = Shape4MouseDown
    end
    object Shape22: TShape
      Tag = 3
      Left = 180
      Top = 166
      Width = 16
      Height = 16
      Brush.Color = clMaroon
      OnMouseDown = Shape4MouseDown
    end
    object Shape23: TShape
      Tag = 3
      Left = 165
      Top = 166
      Width = 16
      Height = 16
      Brush.Color = clMaroon
      OnMouseDown = Shape4MouseDown
    end
    object Shape24: TShape
      Tag = 3
      Left = 150
      Top = 166
      Width = 16
      Height = 16
      Brush.Color = clMaroon
      OnMouseDown = Shape4MouseDown
    end
    object Shape25: TShape
      Tag = 4
      Left = 152
      Top = 202
      Width = 16
      Height = 16
      OnMouseDown = Shape4MouseDown
    end
    object Shape27: TShape
      Tag = 4
      Left = 182
      Top = 202
      Width = 16
      Height = 16
      OnMouseDown = Shape4MouseDown
    end
    object Shape28: TShape
      Tag = 4
      Left = 152
      Top = 217
      Width = 16
      Height = 16
      Brush.Color = clMaroon
      OnMouseDown = Shape4MouseDown
    end
    object Shape29: TShape
      Tag = 4
      Left = 182
      Top = 217
      Width = 16
      Height = 16
      OnMouseDown = Shape4MouseDown
    end
    object Shape30: TShape
      Tag = 4
      Left = 182
      Top = 232
      Width = 16
      Height = 16
      Brush.Color = clMaroon
      OnMouseDown = Shape4MouseDown
    end
    object Shape31: TShape
      Tag = 4
      Left = 167
      Top = 232
      Width = 16
      Height = 16
      Brush.Color = clMaroon
      OnMouseDown = Shape4MouseDown
    end
    object Shape32: TShape
      Tag = 4
      Left = 152
      Top = 232
      Width = 16
      Height = 16
      Brush.Color = clMaroon
      OnMouseDown = Shape4MouseDown
    end
    object Shape33: TShape
      Tag = 5
      Left = 153
      Top = 270
      Width = 16
      Height = 16
      OnMouseDown = Shape4MouseDown
    end
    object Shape34: TShape
      Tag = 5
      Left = 168
      Top = 270
      Width = 16
      Height = 16
      OnMouseDown = Shape4MouseDown
    end
    object Shape35: TShape
      Tag = 5
      Left = 183
      Top = 270
      Width = 16
      Height = 16
      OnMouseDown = Shape4MouseDown
    end
    object Shape36: TShape
      Tag = 5
      Left = 153
      Top = 285
      Width = 16
      Height = 16
      Brush.Color = clMaroon
      OnMouseDown = Shape4MouseDown
    end
    object Shape37: TShape
      Tag = 5
      Left = 183
      Top = 285
      Width = 16
      Height = 16
      OnMouseDown = Shape4MouseDown
    end
    object Shape38: TShape
      Tag = 5
      Left = 183
      Top = 300
      Width = 16
      Height = 16
      OnMouseDown = Shape4MouseDown
    end
    object Shape39: TShape
      Tag = 5
      Left = 168
      Top = 300
      Width = 16
      Height = 16
      Brush.Color = clMaroon
      OnMouseDown = Shape4MouseDown
    end
    object Shape40: TShape
      Tag = 5
      Left = 153
      Top = 300
      Width = 16
      Height = 16
      Brush.Color = clMaroon
      OnMouseDown = Shape4MouseDown
    end
    object Shape41: TShape
      Tag = 6
      Left = 96
      Top = 271
      Width = 16
      Height = 16
      OnMouseDown = Shape4MouseDown
    end
    object Shape42: TShape
      Tag = 6
      Left = 111
      Top = 271
      Width = 16
      Height = 16
      OnMouseDown = Shape4MouseDown
    end
    object Shape43: TShape
      Tag = 6
      Left = 126
      Top = 271
      Width = 16
      Height = 16
      OnMouseDown = Shape4MouseDown
    end
    object Shape44: TShape
      Tag = 6
      Left = 96
      Top = 286
      Width = 16
      Height = 16
      Brush.Color = clMaroon
      OnMouseDown = Shape4MouseDown
    end
    object Shape45: TShape
      Tag = 6
      Left = 126
      Top = 286
      Width = 16
      Height = 16
      OnMouseDown = Shape4MouseDown
    end
    object Shape46: TShape
      Tag = 6
      Left = 126
      Top = 301
      Width = 16
      Height = 16
      OnMouseDown = Shape4MouseDown
    end
    object Shape47: TShape
      Tag = 6
      Left = 111
      Top = 301
      Width = 16
      Height = 16
      OnMouseDown = Shape4MouseDown
    end
    object Shape48: TShape
      Tag = 6
      Left = 96
      Top = 301
      Width = 16
      Height = 16
      Brush.Color = clMaroon
      OnMouseDown = Shape4MouseDown
    end
    object Shape49: TShape
      Tag = 7
      Left = 39
      Top = 270
      Width = 16
      Height = 16
      OnMouseDown = Shape4MouseDown
    end
    object Shape50: TShape
      Tag = 7
      Left = 54
      Top = 270
      Width = 16
      Height = 16
      OnMouseDown = Shape4MouseDown
    end
    object Shape51: TShape
      Tag = 7
      Left = 69
      Top = 270
      Width = 16
      Height = 16
      OnMouseDown = Shape4MouseDown
    end
    object Shape52: TShape
      Tag = 7
      Left = 39
      Top = 285
      Width = 16
      Height = 16
      Brush.Color = clMaroon
      OnMouseDown = Shape4MouseDown
    end
    object Shape53: TShape
      Tag = 7
      Left = 69
      Top = 285
      Width = 16
      Height = 16
      OnMouseDown = Shape4MouseDown
    end
    object Shape54: TShape
      Tag = 7
      Left = 69
      Top = 300
      Width = 16
      Height = 16
      OnMouseDown = Shape4MouseDown
    end
    object Shape55: TShape
      Tag = 7
      Left = 54
      Top = 300
      Width = 16
      Height = 16
      OnMouseDown = Shape4MouseDown
    end
    object Shape56: TShape
      Tag = 7
      Left = 39
      Top = 300
      Width = 16
      Height = 16
      OnMouseDown = Shape4MouseDown
    end
    object Shape57: TShape
      Tag = 8
      Left = 38
      Top = 202
      Width = 16
      Height = 16
      OnMouseDown = Shape4MouseDown
    end
    object Shape58: TShape
      Tag = 8
      Left = 53
      Top = 202
      Width = 16
      Height = 16
      OnMouseDown = Shape4MouseDown
    end
    object Shape59: TShape
      Tag = 8
      Left = 68
      Top = 202
      Width = 16
      Height = 16
      OnMouseDown = Shape4MouseDown
    end
    object Shape60: TShape
      Tag = 8
      Left = 38
      Top = 217
      Width = 16
      Height = 16
      OnMouseDown = Shape4MouseDown
    end
    object Shape61: TShape
      Tag = 8
      Left = 68
      Top = 217
      Width = 16
      Height = 16
      OnMouseDown = Shape4MouseDown
    end
    object Shape62: TShape
      Tag = 8
      Left = 68
      Top = 232
      Width = 16
      Height = 16
      OnMouseDown = Shape4MouseDown
    end
    object Shape63: TShape
      Tag = 8
      Left = 53
      Top = 232
      Width = 16
      Height = 16
      OnMouseDown = Shape4MouseDown
    end
    object Shape64: TShape
      Tag = 8
      Left = 38
      Top = 232
      Width = 16
      Height = 16
      OnMouseDown = Shape4MouseDown
    end
    object Shape65: TShape
      Tag = 4
      Left = 167
      Top = 202
      Width = 16
      Height = 16
      OnMouseDown = Shape4MouseDown
    end
    object Shape20: TShape
      Tag = 3
      Left = 150
      Top = 151
      Width = 16
      Height = 16
      Brush.Color = clMaroon
      OnMouseDown = Shape4MouseDown
    end
    object vlbl1: TLabel
      Left = 43
      Top = 184
      Width = 22
      Height = 14
      Caption = 'vlbl1'
      Font.Color = clBlack
      Font.Height = -11
      Font.Name = 'Arial'
      Font.Style = []
      ParentFont = False
    end
    object vlbl2: TLabel
      Left = 98
      Top = 184
      Width = 32
      Height = 14
      Caption = 'Label9'
      Font.Color = clBlack
      Font.Height = -11
      Font.Name = 'Arial'
      Font.Style = []
      ParentFont = False
    end
    object vlbl3: TLabel
      Left = 156
      Top = 183
      Width = 32
      Height = 14
      Caption = 'Label9'
      Font.Color = clBlack
      Font.Height = -11
      Font.Name = 'Arial'
      Font.Style = []
      ParentFont = False
    end
    object vlbl8: TLabel
      Left = 44
      Top = 250
      Width = 32
      Height = 14
      Caption = 'Label9'
      Font.Color = clBlack
      Font.Height = -11
      Font.Name = 'Arial'
      Font.Style = []
      ParentFont = False
    end
    object vlbl4: TLabel
      Left = 158
      Top = 250
      Width = 32
      Height = 14
      Caption = 'Label9'
      Font.Color = clBlack
      Font.Height = -11
      Font.Name = 'Arial'
      Font.Style = []
      ParentFont = False
    end
    object vlbl7: TLabel
      Left = 44
      Top = 318
      Width = 32
      Height = 14
      Caption = 'Label9'
      Font.Color = clBlack
      Font.Height = -11
      Font.Name = 'Arial'
      Font.Style = []
      ParentFont = False
    end
    object vlbl6: TLabel
      Left = 102
      Top = 319
      Width = 32
      Height = 14
      Caption = 'Label9'
      Font.Color = clBlack
      Font.Height = -11
      Font.Name = 'Arial'
      Font.Style = []
      ParentFont = False
    end
    object vlbl5: TLabel
      Left = 158
      Top = 318
      Width = 32
      Height = 14
      Caption = 'Label9'
      Font.Color = clBlack
      Font.Height = -11
      Font.Name = 'Arial'
      Font.Style = []
      ParentFont = False
    end
    object SpeedButton1: TSpeedButton
      Left = 93
      Top = 202
      Width = 48
      Height = 48
      Caption = 'Help'
      Font.Color = clRed
      Font.Height = -13
      Font.Name = 'Arial'
      Font.Style = [fsBold]
      Glyph.Data = {
        66010000424D6601000000000000760000002800000014000000140000000100
        040000000000F000000000000000000000001000000010000000000000000000
        8000008000000080800080000000800080008080000080808000C0C0C0000000
        FF0000FF000000FFFF00FF000000FF00FF00FFFF0000FFFFFF00888888888888
        8888888800008888888888888888888800008888888887778888888800008888
        8888600788888888000088888888E60788888888000088888888EE6888888888
        000088888888877788888888000088888888600788888888000088888888E607
        78888888000088888888E660778888880000888888888E660778888800008888
        ... (362 bytes total)
      }
      Layout = blGlyphTop
      ParentFont = False
      OnClick = SpeedButton1Click
    end
    object Label2: TLabel
      Left = 32
      Top = 345
      Width = 52
      Height = 13
      Caption = 'Edit Box:'
    end
    object Shape26: TShape
      Tag = 1
      Left = 12
      Top = 102
      Width = 16
      Height = 16
      Brush.Color = clMaroon
      OnMouseDown = Shape4MouseDown
    end
    object Label3: TLabel
      Left = 30
      Top = 103
      Width = 76
      Height = 13
      Caption = '= Full Square'
    end
    object Shape66: TShape
      Tag = 1
      Left = 120
      Top = 102
      Width = 16
      Height = 16
      OnMouseDown = Shape4MouseDown
    end
    object Label4: TLabel
      Left = 140
      Top = 104
      Width = 96
      Height = 13
      Caption = '= Vacant Square'
    end
    object Shape6: TShape
      Tag = 1
      Left = 53
      Top = 166
      Width = 16
      Height = 16
      Brush.Color = clMaroon
      OnMouseDown = Shape4MouseDown
    end
    object Shape15: TShape
      Tag = 2
      Left = 109
      Top = 166
      Width = 16
      Height = 16
      Brush.Color = clMaroon
      OnMouseDown = Shape4MouseDown
    end
    object EditBox: TSpinfltEdit
      Left = 91
      Top = 342
      Width = 53
      Height = 22
      Increment = 0.02
      MaxLength = 3
      MaxValue = 1.0
      TabOrder = 0
      OnChange = EditBoxChange
    end
    object HelpBox: TMemo
      Left = 4
      Top = 221
      Width = 237
      Height = 126
      Cursor = crArrow
      Color = clNavy
      Ctl3D = False
      Enabled = False
      Font.Color = clWhite
      Font.Height = -11
      Font.Name = 'MS Sans Serif'
      Font.Style = [fsBold]
      Lines.Strings = ('Select a particular vacancy pattern by ' 'clicking on it with the mouse (shown ' 'with a red centre). Use the edit box to ' 'change the probability value between 0 ' 'and 1.0 for the selected vacancy ' 'pattern.' '' '0.0 = Rabbit will NOT reproduce' '1.0 = Rabbit will definitely reproduce.')
      ParentCtl3D = False
      ParentFont = False
      ReadOnly = True
      TabOrder = 1
      Visible = False
      OnClick = HelpBoxClick
    end
  end
  object OKBtn: TBitBtn
    Left = 175
    Top = 386
    Width = 77
    Height = 27
    TabOrder = 0
    OnClick = OKBtnClick
    Kind = bkOK
    Margin = 2
    Spacing = -1
    IsControl = True
  end
  object CancelBtn: TBitBtn
    Left = 264
    Top = 385
    Width = 77
    Height = 27
    TabOrder = 1
    Kind = bkCancel
    Margin = 2
    Spacing = -1
    IsControl = True
  end
  object GroupBox2: TGroupBox
    Left = 261
    Top = 8
    Width = 248
    Height = 373
    Caption = ' Slider Setting Control'
    TabOrder = 3
    object Label5: TLabel
      Left = 9
      Top = 55
      Width = 111
      Height = 13
      Caption = 'Rabbit Death Rate:'
    end
    object lbl20: TLabel
      Left = 26
      Top = 96
      Width = 94
      Height = 13
      Caption = 'Fox Death Rate:'
    end
    object lbl21: TLabel
      Left = 9
      Top = 136
      Width = 111
      Height = 13
      Caption = 'Fox Hunting Ability:'
    end
    object lbl22: TLabel
      Left = 14
      Top = 177
      Width = 106
      Height = 13
      Caption = 'Grass Death Rate:'
    end
    object lbl24: TLabel
      Left = 7
      Top = 303
      Width = 115
      Height = 13
      Caption = 'Sunlight Input Rate:'
    end
    object Label6: TLabel
      Left = 119
      Top = 24
      Width = 60
      Height = 13
      Caption = 'Probability'
    end
    object label7: TLabel
      Left = 184
      Top = 24
      Width = 60
      Height = 13
      Hint = 'Value at maximum slider position.'
      Caption = 'Max Value'
      ParentShowHint = False
      ShowHint = True
    end
    object Label9: TLabel
      Left = 44
      Top = 70
      Width = 42
      Height = 13
      Caption = '(0 -> 1)'
    end
    object Bevel1: TBevel
      Left = 14
      Top = 210
      Width = 225
      Height = 2
    end
    object Label10: TLabel
      Left = 16
      Top = 223
      Width = 218
      Height = 56
      Caption = 'The amount of sunlight is measured using a number between zero and 1.0. A value of zero indicating no sunlight and a value of 1.0 indicating maximum sunlight.'
      Font.Color = clBlack
      Font.Height = -11
      Font.Name = 'Arial'
      Font.Style = []
      ParentFont = False
      WordWrap = True
    end
    object Label8: TLabel
      Left = 180
      Top = 275
      Width = 60
      Height = 13
      Hint = 'Value at maximum slider position.'
      Caption = 'Max Value'
      ParentShowHint = False
      ShowHint = True
    end
    object EditRDeath: TSpinfltEdit
      Left = 123
      Top = 52
      Width = 60
      Height = 23
      Increment = 0.01
      MaxValue = 1.0
      TabOrder = 0
    end
    object EditFDeath: TSpinfltEdit
      Left = 123
      Top = 93
      Width = 60
      Height = 22
      Increment = 0.01
      MaxValue = 1.0
      TabOrder = 1
    end
    object EditFHunt: TSpinfltEdit
      Left = 123
      Top = 131
      Width = 60
      Height = 22
      Increment = 0.01
      MaxValue = 1.0
      TabOrder = 2
    end
    object EditGDeath: TSpinfltEdit
      Left = 123
      Top = 173
      Width = 60
      Height = 22
      Increment = 0.01
      MaxValue = 1.0
      TabOrder = 3
    end
    object EditSunInput: TSpinfltEdit
      Left = 125
      Top = 300
      Width = 60
      Height = 22
      Increment = 0.01
      MaxValue = 100.0
      TabOrder = 4
    end
    object EditRDeathMax: TSpinfltEdit
      Left = 189
      Top = 52
      Width = 50
      Height = 22
      Increment = 0.1
      MaxValue = 1.0
      TabOrder = 5
    end
    object EditFDeathMax: TSpinfltEdit
      Left = 190
      Top = 93
      Width = 49
      Height = 22
      Increment = 0.1
      MaxValue = 1.0
      TabOrder = 6
    end
    object EditFHuntMax: TSpinfltEdit
      Left = 190
      Top = 131
      Width = 49
      Height = 22
      Increment = 0.1
      MaxValue = 1.0
      TabOrder = 7
    end
    object EditSolarMax: TSpinfltEdit
      Left = 191
      Top = 300
      Width = 47
      Height = 22
      Increment = 0.1
      MaxValue = 1.0
      TabOrder = 8
    end
    object EditGDeathMax: TSpinfltEdit
      Left = 190
      Top = 173
      Width = 49
      Height = 22
      Increment = 0.1
      MaxValue = 1.0
      TabOrder = 9
    end
  end
end
